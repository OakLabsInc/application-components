const grpc = require('grpc')
const protobuf = require('protobufjs')
const tools = require('oak-tools')
const _ = require('lodash')
const {inspect} = require('util')

const {join} = require('path')
const rel = (...paths) => join(__dirname, '../../..', ...paths)
const PROTO_PATH = rel('protos/payment.proto')

const debug = process.env.DEBUG === 'true'
let logger = tools.logger({
  level: debug ? 'debug' : 'info',
  pretty: debug
})

// STATE: config object that this service will use for its lifetime
const configuration = {}

// add new provider implementations here
const providers = {
  TEST: require('./providers/test')
}

// calls the implementation for the requested ProviderType
const callProviderMethod = (provider_type, method_name, params, done) => {

  // return the method if it exists, otherwise return notImplemented
  const notImplemented = (params, done) =>
    done(new Error(`Method ${provider_type}.${method_name} not implemented.`))
  const method = _.get(providers, [provider_type, method_name], notImplemented)

  // call the method
  method(params, done)
}

// looks up the configuration for the requested provider_name
const getProviderType = (provider_name, done) => {
  if (_.isEmpty(configuration)) {
    return done(new Error('You must use Payment.Configure first.'), {})
  }

  const provider = _.find(configuration.providers, {provider_name})
  if (!provider) {
    return done(new Error(`Provider ${provider_name} not found in configuration.`))
  }
  const {provider_type} = provider
  return provider_type
}

// grpc implementation: referenced below in main()
const Implementation = {
  Info: (params, done) => {
    var status
    if (_.isEmpty(configuration)) {
      status = {configured: false}
    } else {
      //console.log(inspect(configuration))
      status = {
        configured: true,
        configuration
      }
    }
    done(null, status)
  },
  Configure: ({request}, done) => {
    _.merge(configuration, request)
    return done()
  },
  Sale: (params, done) => {
    const {provider_name} = params.request.sale_request
    const provider_type = getProviderType(provider_name, done)
    if (!provider_type) return

    callProviderMethod(provider_type, 'Sale', params, done)
  }
}

function main (opts = {}, done = (err) => {if (err) logger.error(err)}) {
  const host = `0.0.0.0:${process.env.PORT || opts.port || '8005'}`
  const server = new grpc.Server()

  // protobufjs automatically converts all fields to camelcase (undocumented feature)
  // this setting stops that behavior
  // https://github.com/dcodeIO/protobuf.js/issues/959#issuecomment-349831311
  const root = new protobuf.Root();
  root.load(PROTO_PATH, {keepCase: true}, (err, protoDef) => {
    if (err) return done(err)
    const protoPkg = grpc.loadObject(protoDef)
    const grpcService = protoPkg.oak.platform.Payment.service

    server.addService(grpcService, Implementation)
    server.bind(host, grpc.ServerCredentials.createInsecure())
    logger.info('Payment API server on ' + host)
    server.start()
    done()
  })
}

// only start the server if we were run directly
// otherwise just export the main function so the caller can run it
if (require.main === module) {
  main()
}

module.exports = main
module.exports.PROTO_PATH = PROTO_PATH
