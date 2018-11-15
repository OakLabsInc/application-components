require('dotenv').config()
const {HOST} = process.env

const grpc = require('grpc')
const protobuf = require('protobufjs')
const tools = require('oak-tools')
const _ = require('lodash')
const {inspect} = require('util')

const {join} = require('path')
const rel = (...paths) => join(__dirname, '..', ...paths)
const PROTO_PATH = rel('protos/payment.proto')
const rest_proxy = require('./rest_proxy')

const debug = require('debug')('payment')

// I'm not sure we want to use this... 'debug' module probably gets the job done
let logger = tools.logger({
  level: 'debug',
  pretty: debug
})

// STATE: config object that this service will use for its lifetime
const configuration = {}

// add new provider implementations here
const providers = {
  TEST: require('./providers/test'),
  FREEDOMPAY: require('./providers/freedompay'),
  WORLDPAY: require('./providers/worldpay'),
}

// fields that must be provided for a given provider config
// provider_name, provider_type required by all
const provider_required_configuration = {
  TEST: [],
  FREEDOMPAY: ['location_id', 'terminal_id'],
  WORLDPAY: ['api_id', 'api_key', 'application_id', 'lane_id']
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
const getProviderConfig = (provider_name, done) => {
  if (_.isEmpty(configuration)) {
    return done(new Error('You must use Payment.Configure first.'), {})
  }

  const provider = _.find(configuration.providers, {provider_name})
  if (!provider) {
    return done(new Error(`Provider ${provider_name} not found in configuration.`))
  }
  return provider
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
    debug('received configuration: %O', request)

    // validate configuration
    if (!Array.isArray(request.providers) ||
      request.providers.length < 1) {
      return done(new Error('must supply at least one provider'))
    }
    const provider_errors = _(request.providers)
      .flatMap(check_provider)
      .compact()
      .value()
    if (provider_errors.length > 0)
      return done(new Error(
        ['Invalid payment configuration:']
        .concat(provider_errors)
        .join('\n')
      ))

    // everything appears to be good, merge it
    _.merge(configuration, request)
    return done()
  },
  Sale: (params, done) => {
    const {provider_name} = params.request.sale_request
    const provider = getProviderConfig(provider_name, done)
    if (!provider) return done(new Error(`Invalid provider ${provider_name}`))
    params.provider_config = provider

    callProviderMethod(provider.provider_type, 'Sale', params, done)
  },
  Auth: (params, done) => {
    const {provider_name} = params.request.sale_request
    const provider = getProviderConfig(provider_name, done)
    if (!provider) return done(new Error(`Invalid provider ${provider_name}`))
    params.provider_config = provider

    callProviderMethod(provider.provider_type, 'Auth', params, done)
  },
  Capture: (params, done) => {
    const {provider_name} = params.request.sale_request
    const provider = getProviderConfig(provider_name, done)
    if (!provider) return done(new Error(`Invalid provider ${provider_name}`))
    params.provider_config = provider

    callProviderMethod(provider.provider_type, 'Capture', params, done)
  },
  Cancel: (params, done) => {
    const {provider_name} = params.request.sale_request
    const provider = getProviderConfig(provider_name, done)
    if (!provider) return done(new Error(`Invalid provider ${provider_name}`))
    params.provider_config = provider

    callProviderMethod(provider.provider_type, 'Cancel', params, done)
  }
}

// validation for provider configs
function check_provider(p, index) {
  const errors = []
  const required_field = (f) => {
    return p[f] ? 0 : errors.push(`provider config #${index+1} missing required field ${f}`)
  }

  // fields required for all provider configs
  (['provider_name', 'provider_type']).forEach(required_field)
  if (errors.length > 0)
    return errors

  // check provider_type value
  const valid_provider_types = _.keys(providers)
  if (!_.includes(valid_provider_types, p.provider_type)) {
    errors.push(`provider config #${index+1} has invalid provider_type: '${p.provider_type}'`)
  }
  if (errors.length > 0)
    return errors

  // check required fields for the selected provider
  provider_required_configuration[p.provider_type]
    .forEach(required_field)

  // add the provider_type to these errors for help in debugging
  return errors.map(e => p.provider_type + ' ' + e)
}

function main (done = (err) => {if (err) logger.error(err)}) {
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
    server.bind(HOST, grpc.ServerCredentials.createInsecure())
    logger.info('Payment API server on ' + HOST)
    server.start()
    rest_proxy().catch(done).then(() => done())
  })
}

// only start the server if we were run directly
// otherwise just export the main function so the caller can run it
if (require.main === module) {
  main()
}

module.exports = main
module.exports.PROTO_PATH = PROTO_PATH
