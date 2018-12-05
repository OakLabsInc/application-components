require('dotenv').config()
const {HOST} = process.env

const {test} = require('tape')
const grpc = require('grpc')
const {inspect} = require('util')

const paymentService = require('..')
const {PROTO_PATH} = paymentService

test('should start the service', (t) => {
  paymentService(t.end)
})

let client
test('should create a client', (t) => {
  const {Payment} = grpc.load(PROTO_PATH).oak.platform
  client = new Payment(HOST, grpc.credentials.createInsecure())
  t.end()
})

test('info should return not configured', (t) => {
  client.Info({}, (err, info) => {
    t.error(err)
    t.deepEqual(info, {configured: false, configuration: null})
    t.end()
  })
})

test('should configure the service', (t) => {
  client.Configure({
    providers: [{
      provider_name: 'test_provider',
      provider_type: 'TEST',
    }]
  }, (err) => {
    t.error(err)
    t.end()
  })
})

test('info should return configured', (t) => {
  client.Info({}, (err, info) => {
    t.error(err)
    t.deepEqual(info, {
        configured: true,
        configuration: {
          providers: [
            {
              provider_name: 'test_provider',
              provider_type: 'TEST',
              solution: 'DEFAULT',
              host: '',
              api_id: '',
              api_key: '',
              batch_interval: 'OFF',
              batch_hour: 0,
              location_id: '',
              terminal_id: '',
              environment_description: '',
              application_id: 0,
              lane_id: 0,
            }
          ]
        }
      })
    t.end()
  })
})

test('should process a sale', (t) => {
  client.Sale({
    sale_request: {
      provider_name: 'test_provider',
      amount: "51.00"
    }
  }, (err, response) => {
    t.error(err)
    t.deepEqual(response, {
      provider_type: 'TEST',
      response: {
        status: 'ACCEPTED',
        error: '',
        sale_amount: '51.00',
        currency: 'USD',
        masked_card_number: '4111xxxxxxxx5121',
        name_on_card: 'Thomas Jefferson',
        transaction_id: '',
        card_issuer: '',
        request_id: '',
      },
      freedompay_response: null,
      worldpay_response: null
    })
    t.end()
  })
})

// otherwise the server will keep the process open
// don't know of a way to programmatically stop the GRPC server
// maybe reading documentation would help.  :-)
test('should exit', (t) => {t.end(); process.exit()})
