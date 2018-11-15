const {
  HOST,
  REST_PROXY_PORT,
} = process.env

const debug = require('debug')('rest')
const _ = require('lodash')
const {join} = require('path')
const express = require('express')
const cors = require('cors')
const rel = (...paths) => join(__dirname, '../..', ...paths)
const grpc = require('grpc')
const protoLoader = require('@grpc/proto-loader')

module.exports = async () => {
  if (!REST_PROXY_PORT) {
    return Promise.reject(new Error('REST_PROXY_PORT not set.  Could not start REST proxy.'))
  }

  // create grpc client
  const protoDef = await protoLoader
    .load(rel('protos/payment.proto'), {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    })
  const {Payment} = grpc.loadPackageDefinition(protoDef).oak.platform
  const client = new Payment(HOST, grpc.credentials.createInsecure())

  // create rest proxy server
  const app = express()
  app.use(cors())
  app.use(require('body-parser').json())

  // attach grpc methods to the proxy server
  attach_rpc(app, client, '/api/payment')

  return new Promise((resolve, reject) => app.listen(REST_PROXY_PORT,
    (err) => err ? reject(err) : resolve(app)))
}

const attach_rpc = (app, client, namespace) => {

  // get the methods available on the GRPC client
  const methods = _(client.$method_names)
    .values()
    .map(n => n.toLowerCase())
    .value()

  // helper to attach a handler
  const listen = (method) => {
    const path = `${namespace}/${method}`
    app.post(path, (req, res) => {
      debug('request body: %O', req.body)
      client[method](req.body, (error, result) => {
        if (error) {
          res.status(500).json({error})
        } else {
          res.json(result)
        }
      })
    })
  }

  // attach all methods
  methods.forEach(listen)
}
