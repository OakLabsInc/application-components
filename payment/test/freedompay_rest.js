require('dotenv').config()
const {
  HOST,
  FREEDOMPAY_HOST,
  REST_PROXY_PORT,
  LOCATION_ID,
  TERMINAL_ID,
} = process.env

const _ = require('lodash')
const debug = require('debug')('test')
const {test} = require('tape')
const grpc = require('grpc')
const paymentService = require('..')
const {PROTO_PATH} = paymentService

test('should start the service', (t) => {
  paymentService(t.end)
})

const baseURL = `http://0.0.0.0:${REST_PROXY_PORT}/api/payment`
const client = require('axios').create({baseURL})

test('info should return not configured', (t) => {
  client
    .post('/info')
    .then(({data}) => {
      t.deepEqual(data, {configured: false, configuration: null})
      t.end()
    })
    .catch(err => {t.error(err); t.end();})
})

const {inspect} = require('util')
test('should configure the service', (t) => {
  client
    .post('/configure', {
      providers: [{
        provider_name: 'freedompay',
        provider_type: 'FREEDOMPAY',
        host: FREEDOMPAY_HOST,
        location_id: LOCATION_ID,
        terminal_id: TERMINAL_ID,
      }]
    })
    .then(() => t.end())
    .catch(err => t.end(_.get(err, 'response.data.error.details')))
})

test('info should return configured', (t) => {
  const expected = {
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
          environment_description: '',
          application_id: 0,
          lane_id: 0,
        }
      ]
    }
  }
  client
    .post('/info')
    .then(({data}) => {
      t.deepEqual(data, expected)
      t.end()
    })
    .catch(err => {t.error(err); t.end();})
})

test('should successfully process a sale', async (t) => {
  const invoice_number = uuid()
  const {data} = await client.post('/sale', {
    sale_request: {
      provider_name: 'freedompay',
      merchant_ref: invoice_number,
      invoice_number: invoice_number,
      amount: '10.50'
    }
  })

  //// test dynamic fields
  const {transaction_id, masked_card_number, name_on_card, card_issuer, request_id} = data.response
  const {expiry_date, receipt_text, request_guid} = data.freedompay_response
  t.ok(transaction_id, 'transaction_id')
  t.ok(masked_card_number, 'masked_card_number exists')
  t.equal(masked_card_number.length, 16, 'masked_card_number length')
  t.ok(card_issuer, 'card_issuer')
  t.ok(name_on_card, 'name_on_card')
  t.ok(expiry_date, 'expiry_date')
  t.ok(receipt_text, 'receipt_text')

  const expected = {
    provider_type: 'FREEDOMPAY',
    response: {
      status: 'ACCEPTED',
      error: '',
      sale_amount: '10.50',
      currency: 'USD',
      masked_card_number,
      name_on_card,
      transaction_id,
      card_issuer: 'VISA',
      request_id,
    },
    freedompay_response: {
      request_guid,
      approved_amount: '10.50',
      dcc_accepted: 'false',
      decision: 'A',
      error_code: '100',
      msg: 'APPROVED',
      name_on_card,
      issuer_name: card_issuer,
      expiry_date,
      merchant_reference_code: invoice_number,
      entry_mode: 'swiped',
      receipt_text,
      code: '',
      pin_verified: 'false',
      device_verified: 'false',
      signature_required: 'false',
      request_id,
      transaction_id,
    },
    worldpay_response: null
  }
  t.deepEqual(data, expected)
  t.end()
})


// otherwise the server will keep the process open
// don't know of a way to programmatically stop the GRPC server
// maybe reading documentation would help.  :-)
test('should exit', (t) => {t.end(); process.exit()})
