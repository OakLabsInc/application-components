const grpc = require('grpc')
const uuid = require('uuid/v4')

const location_id = '1460175013' // this value is good for testing, will need to change to the production merchant_id
const terminal_id = '2463834019' // this value is good for testing, will need to change to the production terminal_id

const {PROTO_PATH} = paymentService
const host = '0.0.0.0:8008'
const FREEDOMPAY_HOST = 'http://10.0.1.34:1011'

test('should start the service', (t) => {
  paymentService({host}, t.end)
})

let client
test('should create a client', (t) => {
  const {Payment} = grpc.load(PROTO_PATH).oak.platform
  client = new Payment(host, grpc.credentials.createInsecure())
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
      location_id,
      terminal_id,
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
            location_id,
            terminal_id,
            environment_description: ''
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
      }
    })
    t.end()
  })
})


let last_invoice = 1
const get_invoice_number = () => 'invoice ' + last_invoice++

test('should reject a sale over the floor limit', (t) => {
  const invoice_number = get_invoice_number()
  client.Sale({
    sale_request: {
      provider_name: 'freedompay',
      merchant_ref: invoice_number,
      invoice_number: invoice_number,
      amount: '51'
    }
  }, (err, response) => {
    t.error(err)

    // test dynamic fields
    const {transaction_id, masked_card_number, name_on_card, card_issuer, request_id} = response.response
    const {expiry_date, receipt_text, request_guid} = response.freedompay_response
    t.ok(request_guid, 'request_guid')
    t.ok(masked_card_number, 'masked_card_number')
    t.equal(masked_card_number.length, 16, 'card format')
    t.ok(card_issuer, 'card_issuer')

    t.deepEqual(response, {
      provider_type: 'FREEDOMPAY',
      response: {
        status: 'REJECTED',
        error: 'Declined - Exceeds floor limit',
        sale_amount: '0',
        currency: 'USD',
        masked_card_number,
        name_on_card,
        transaction_id,
        card_issuer,
        request_id: '',
      },
      freedompay_response: {
        request_guid,
        approved_amount: '0',
        dcc_accepted: 'false',
        decision: 'R',
        error_code: '3022',
        msg: 'Declined - Exceeds floor limit',
        name_on_card: '',
        issuer_name: card_issuer,
        expiry_date: '',
        merchant_reference_code: '',
        entry_mode: '',
        receipt_text,
        code: '',
        pin_verified: 'false',
        device_verified: 'false',
        signature_required: 'true',
        request_id: '',
        transaction_id: '',
      }
    })
    t.end()
  })
})

test('should successfully process a sale', (t) => {
  const invoice_number = get_invoice_number()
  client.Sale({
    sale_request: {
      provider_name: 'freedompay',
      merchant_ref: invoice_number,
      invoice_number: invoice_number,
      amount: '10.50'
    }
  }, (err, response) => {
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

    t.deepEqual(response, {
      provider_type: 'FREEDOMPAY',
      response: {
        status: 'ACCEPTED',
        error: '',
        sale_amount: '10.50',
        currency: 'USD',
        masked_card_number: '414720XXXXXX8479',
        name_on_card: 'MASON/BRANDON ',
        transaction_id,
        card_issuer: 'VISA',
        request_id,
      },
      freedompay_response: {
        request_guid,
        approved_amount: '10.50',
        dcc_accepted: 'false',
        decision: 'A',
        error_code: '3021',
        msg: 'ACCEPTED',
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
      }
    })
    t.end()
  })
})


// otherwise the server will keep the process open
// don't know of a way to programmatically stop the GRPC server
// maybe reading documentation would help.  :-)
test('should exit', (t) => {t.end(); process.exit()})
