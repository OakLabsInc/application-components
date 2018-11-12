require('dotenv').config()
const debug = require('debug')('test')
const {
  HOST,
  FREEDOMPAY_HOST,
  LOCATION_ID,
  TERMINAL_ID,
} = process.env

const {test} = require('tape')

const grpc = require('grpc')
const {inspect} = require('util')
const uuid = require('uuid/v4')

const paymentService = require('../..')
const {PROTO_PATH} = paymentService

const shared = {}

test('should start the service', (t) => {
  paymentService({host: HOST}, t.end)
})

// it's like get_type except it's actually useful
const getType = (obj) => {
  const ptype = Object.prototype.toString.call(obj).slice(8, -1)
  return ptype === 'Object' ? obj.constructor.name.toString() : ptype
}

let client
test('should create a client', (t) => {
  const {Payment} = grpc.load(PROTO_PATH).oak.platform
  client = new Payment(HOST, grpc.credentials.createInsecure())
  t.end()
})

test('should configure the service with all required fields', (t) => {
  client.Configure({
    providers: [{
      provider_name: 'freedompay',
      provider_type: 'FREEDOMPAY',
      host: FREEDOMPAY_HOST,
      location_id: LOCATION_ID,
      terminal_id: TERMINAL_ID,
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
            location_id: LOCATION_ID,
            terminal_id: TERMINAL_ID,
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

const expectSuccess = (t, fields = {}) => {
  const {amount} = fields
  return (err, response) => {
    t.error(err)

    //// test dynamic fields
    const {transaction_id, masked_card_number, name_on_card, card_issuer, request_id} = response.response
    const {expiry_date, receipt_text, request_guid} = response.freedompay_response
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
        sale_amount: amount,
        currency: 'USD',
        masked_card_number,
        name_on_card,
        transaction_id,
        card_issuer: 'VISA',
        request_id,
      },
      freedompay_response: {
        request_guid,
        approved_amount: amount,
        dcc_accepted: 'false',
        decision: 'A',
        error_code: '3021',
        msg: 'ACCEPTED',
        name_on_card,
        issuer_name: card_issuer,
        expiry_date,
        merchant_reference_code: shared.invoice_number,
        entry_mode: 'icc',
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
  }
}

test('should successfully process an auth request', (t) => {
  shared.invoice_number = get_invoice_number()
  client.Auth({
    sale_request: {
      provider_name: 'freedompay',
      merchant_ref: shared.invoice_number,
      invoice_number: shared.invoice_number,
      amount: '2.07'
    }
  }, expectSuccess(t, {amount: '2.07'}))
})

test('should successfully process a capture request', (t) => {
  client.Capture({
    sale_request: {
      provider_name: 'freedompay',
      merchant_ref: shared.invoice_number,
      request_id: shared.request_id,
      invoice_number: shared.invoice_number,
      amount: '2.07'
    }
  }, (err, response) => {
    t.error(err)

    //// test dynamic fields
    const {transaction_id, name_on_card, card_issuer, request_id} = response.response
    const {expiry_date, receipt_text, request_guid} = response.freedompay_response
    t.ok(transaction_id, 'transaction_id')
    t.ok(request_id, 'request_id')

    t.deepEqual(response, {
      provider_type: 'FREEDOMPAY',
      response: {
        status: 'ACCEPTED',
        error: '',
        sale_amount: '2.07',
        currency: 'USD',
        masked_card_number: '',
        name_on_card: '',
        transaction_id,
        card_issuer: '',
        request_id,
      },
      freedompay_response: {
        request_guid,
        approved_amount: '2.07',
        dcc_accepted: 'false',
        decision: 'A',
        error_code: '3021',
        msg: 'ACCEPTED',
        name_on_card: '',
        issuer_name: '',
        expiry_date: '',
        merchant_reference_code: shared.invoice_number,
        entry_mode: '',
        receipt_text: '',
        code: '',
        pin_verified: '',
        device_verified: '',
        signature_required: '',
        request_id,
        transaction_id,
      }
    })
    t.end()
  })
})

// otherwise the server will keep the process open
// don't know of a way to programmatically stop the GRPC server
// maybe reading documentation would help.  :-)
test('should exit', (t) => {t.end(); process.exit()})
