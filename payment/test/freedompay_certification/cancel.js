const {test} = require('tape')

const grpc = require('grpc')
const {inspect} = require('util')
const torch = require('torch')
const uuid = require('uuid/v4')

const paymentService = require('../..')
const {PROTO_PATH} = paymentService
const host = '0.0.0.0:8008'
const FREEDOMPAY_HOST = 'http://10.0.1.34:1011'

const shared = {}

test('should start the service', (t) => {
  paymentService({host}, t.end)
})

// it's like get_type except it's actually useful
const getType = (obj) => {
  const ptype = Object.prototype.toString.call(obj).slice(8, -1)
  return ptype === 'Object' ? obj.constructor.name.toString() : ptype
}

let client
test('should create a client', (t) => {
  const {Payment} = grpc.load(PROTO_PATH).oak.platform
  client = new Payment(host, grpc.credentials.createInsecure())
  t.end()
})

test('should configure the service with all required fields', (t) => {
  client.Configure({
    providers: [{
      provider_name: 'freedompay',
      provider_type: 'FREEDOMPAY',
      host: FREEDOMPAY_HOST,
      location_id: 'The Alamo',
      terminal_id: 'Register 1',
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
            provider_name: 'freedompay',
            provider_type: 'FREEDOMPAY',
            solution: 'DEFAULT',
            host: FREEDOMPAY_HOST,
            api_id: '',
            api_key: '',
            batch_interval: 'OFF',
            batch_hour: 0,
            location_id: 'The Alamo',
            terminal_id: 'Register 1',
            environment_description: ''
          }
        ]
      }
    })
    t.end()
  })
})

let last_invoice = 1
const get_invoice_number = () => 'invoice ' + last_invoice++

test('should successfully process an auth request', (t) => {
  shared.mref = uuid()
  shared.invoice_number = get_invoice_number()
  client.Auth({
    sale_request: {
      provider_name: 'freedompay',
      merchant_ref: shared.mref,
      invoice_number: shared.invoice_number,
      amount: '2.01'
    }
  }, (err, response) => {
    t.error(err)

    //// test dynamic fields
    const {error, transaction_id, masked_card_number, name_on_card, card_issuer, request_id} = response.response
    const {expiry_date, receipt_text, request_guid} = response.freedompay_response
    t.notOk(error, 'should not have an error')
    t.ok(transaction_id, 'transaction_id')
    t.ok(masked_card_number, 'masked_card_number exists')
    t.equal(masked_card_number.length, 16, 'masked_card_number length')
    t.ok(card_issuer, 'card_issuer')
    t.ok(name_on_card, 'name_on_card')
    t.ok(expiry_date, 'expiry_date')
    t.ok(receipt_text, 'receipt_text')
    t.ok(request_id, 'request_id')
    shared.request_id = request_id

    t.deepEqual(response, {
      provider_type: 'FREEDOMPAY',
      response: {
        status: 'ACCEPTED',
        error: '',
        sale_amount: '2.01',
        currency: 'USD',
        masked_card_number: '414720XXXXXX8479',
        name_on_card: 'MASON/BRANDON ',
        transaction_id,
        card_issuer: 'VISA',
        request_id,
      },
      freedompay_response: {
        request_guid,
        approved_amount: '2.01',
        dcc_accepted: 'false',
        decision: 'A',
        error_code: '3021',
        msg: 'ACCEPTED',
        name_on_card,
        issuer_name: card_issuer,
        expiry_date,
        merchant_reference_code: shared.mref,
        entry_mode: 'swiped',
        receipt_text,
        code: '',
        pin_verified: 'false',
        device_verified: 'false',
        signature_required: 'false',
        request_id,
        transaction_id,
      }
    })
    t.end()
  })
})

test('system should cancel an auth request', (t) => {
  client.Cancel({
    standard_request: {
      provider_name: 'freedompay',
      merchant_ref: shared.mref,
    }
  }, (err, response) => {
    t.error(err)

    //// test dynamic fields
    const {status, error} = response.standard_response
    const {request_guid} = response.freedompay_response

    t.deepEqual(response, {
      provider_type: 'FREEDOMPAY',
      standard_response: {
        status: 'ACCEPTED',
        error: '',
      },
      freedompay_response: {
        request_guid,
        approved_amount: '0',
        dcc_accepted: 'false',
        decision: 'A',
        error_code: '100',
        msg: 'ACCEPT',
      }
    })
    t.end()
  })
})


// otherwise the server will keep the process open
// don't know of a way to programmatically stop the GRPC server
// maybe reading documentation would help.  :-)
test('should exit', (t) => {t.end(); process.exit()})
