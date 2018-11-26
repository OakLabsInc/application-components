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

let text_id = 1
const get_text_id = () => (text_id++).toString().padStart(10, '0')

//test('should start the service', (t) => {
  //paymentService(t.end)
//})

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
  //const invoice_number = get_text_id()
  //client.Sale({
    //sale_request: {
      //provider_name: 'freedompay',
      //merchant_ref: invoice_number,
      //invoice_number: invoice_number,
      //amount: '51'
    //}
  //}, (err, response) => {
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
  const invoice_number = get_text_id()
  const customer_id = get_text_id()
  const customer_code = get_text_id()
  const product_code = get_text_id()
  const product_upc = get_text_id()
  const product_sku = get_text_id()
  const product_serial1 = get_text_id()
  const customer_asset_id = get_text_id()
  client.Sale({
    sale_request: {
      provider_name: 'freedompay',
      merchant_ref: invoice_number,
      invoice_number,
      amount: '10.50'
    },
    freedompay_request: {
      purchase_info: {
        customer_po_number: invoice_number,
        customer_po_date: '2018-11-22',
        customer_id,
        customer_code,
      },

      items: [{
        discount_amount: '0',
        discount_flag: 'N',
        product_code,
        product_upc,
        product_sku,
        product_name: 'underpants',
        product_description: 'don\'t let the gnomes take \'em',
        product_make: 'XL24D',
        product_model: 'The Undertaker',
        commodity_code: '53102300', // proper UNSPSC code for undergarments
        product_year: '1994',
        product_serial1,
        customer_asset_id,
        unit_price: '10.00',
        quantity: 5,
        total_amount: '50.00',
        tax_amount: '4.00',
        freight_amount: '6.50',
        unit_of_measure: 'unit',
        sale_code: 'S',
      }]
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
    t.deepEqual(response, expected)
    t.end()
  })
})


// otherwise the server will keep the process open
// don't know of a way to programmatically stop the GRPC server
// maybe reading documentation would help.  :-)
test('should exit', (t) => {t.end(); process.exit()})
