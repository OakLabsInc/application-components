require('dotenv').config()
const {
  HOST,
  FREEDOMPAY_HOST,
  LOCATION_ID,
  TERMINAL_ID,
} = process.env

const {test} = require('tape')
const grpc = require('grpc')
const paymentService = require('..')
const {PROTO_PATH} = paymentService
const uuid = require('uuid/v4')
const {fpay_level1_sale, fpay_level3_sale, fpay_expect_success} = require('./helpers')

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

test('should configure the service without required freedompay fields', (t) => {
  client.Configure({
    providers: [{
      provider_name: 'freedompay',
      provider_type: 'FREEDOMPAY',
      host: FREEDOMPAY_HOST,
    }]
  }, (err) => {
    t.ok(err)
    t.equal(err.message, `2 UNKNOWN: Invalid payment configuration:
FREEDOMPAY provider config #1 missing required field location_id
FREEDOMPAY provider config #1 missing required field terminal_id`)
    t.end()
  })
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

test('should fail to process a sale without a merchant_ref', (t) => {
  client.Sale({
    sale_request: {
      provider_name: 'freedompay',
      amount: '10.50'
    }
  }, (err, response) => {
    t.error(err)
    const {transaction_id, masked_card_number, name_on_card, card_issuer, request_id} = response.response
    const {expiry_date, receipt_text, request_guid} = response.freedompay_response
    t.ok(request_guid, 'request_guid')

    t.deepEqual(response, {
      provider_type: 'FREEDOMPAY',
      response: {
        status: 'INPUT_ERROR',
        error: '3010 Missing MerchantReferenceCode',
        sale_amount: '0',
        currency: 'USD',
        masked_card_number: '',
        name_on_card: '',
        transaction_id,
        card_issuer: '',
        request_id: '',
      },
      freedompay_response: {
        request_guid,
        approved_amount: '0',
        dcc_accepted: 'false',
        decision: 'E',
        error_code: '3010',
        msg: '3010 Missing MerchantReferenceCode',
        name_on_card: '',
        issuer_name: '',
        expiry_date: '',
        merchant_reference_code: '',
        entry_mode: '',
        receipt_text: '',
        code: '',
        pin_verified: '',
        device_verified: '',
        signature_required: '',
        request_id: '',
        transaction_id: '',
      },
      worldpay_response: null
    })
    t.end()
  })
})


// test only if gateway is disconnected
//test('should reject a sale over the floor limit', (t) => {
  //client.Sale(fpay_level1Sale({amount: '51'}), (err, response) => {
    //t.error(err)

    //// test dynamic fields
    //const {transaction_id, masked_card_number, name_on_card, card_issuer, request_id} = response.response
    //const {expiry_date, receipt_text, request_guid} = response.freedompay_response
    //t.ok(request_guid, 'request_guid')
    //t.ok(masked_card_number, 'masked_card_number')
    //t.equal(masked_card_number.length, 16, 'card format')
    //t.ok(card_issuer, 'card_issuer')

    //t.deepEqual(response, {
      //provider_type: 'FREEDOMPAY',
      //response: {
        //status: 'REJECTED',
        //error: 'Declined - Exceeds floor limit',
        //sale_amount: '0',
        //currency: 'USD',
        //masked_card_number,
        //name_on_card,
        //transaction_id,
        //card_issuer,
        //request_id: '',
      //},
      //freedompay_response: {
        //request_guid,
        //approved_amount: '0',
        //dcc_accepted: 'false',
        //decision: 'R',
        //error_code: '3022',
        //msg: 'Declined - Exceeds floor limit',
        //name_on_card: '',
        //issuer_name: card_issuer,
        //expiry_date: '',
        //merchant_reference_code: '',
        //entry_mode: '',
        //receipt_text,
        //code: '',
        //pin_verified: 'false',
        //device_verified: 'false',
        //signature_required: 'true',
        //request_id: '',
        //transaction_id: '',
      //},
      //worldpay_response: null
    //})
    //t.end()
  //})
//})

test('should successfully process a sale', (t) => {
  const sale_data = fpay_level3_sale({amount: '10.50'})
  const {invoice_number} = sale_data.sale_request

  client.Sale(sale_data, fpay_expect_success(t, {amount: '10.50', invoice_number}))
})


// otherwise the server will keep the process open
// don't know of a way to programmatically stop the GRPC server
// maybe reading documentation would help.  :-)
test('should exit', (t) => {t.end(); process.exit()})
