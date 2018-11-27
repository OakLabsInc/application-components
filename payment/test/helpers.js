require('dotenv').config()
const {
  HOST,
  FREEDOMPAY_HOST,
  LOCATION_ID,
  TERMINAL_ID,
} = process.env

const grpc = require('grpc')
const paymentService = require('..')
const {PROTO_PATH} = paymentService

let text_id = 1
const get_text_id = () => (text_id++).toString().padStart(10, '0')

function standard_boot(test, shared) {
  test('should start the service', (t) => {
    paymentService(t.end)
  })

  test('should create a client', (t) => {
    const {Payment} = grpc.load(PROTO_PATH).oak.platform
    shared.client = new Payment(HOST, grpc.credentials.createInsecure())
    t.end()
  })

}

function fpay_standard_config(test, shared) {
  test('should configure the service with all required fields', (t) => {
    shared.client.Configure({
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
    shared.client.Info({}, (err, info) => {
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
}

// sale data with just level 1 information for FreedomPay cert
function fpay_level1_sale(args={}) {
  const amount = args.amount || '10.00'
  const {request_id} = args

  const invoice_number = get_text_id()
  return {
    sale_request: {
      provider_name: 'freedompay',
      merchant_ref: invoice_number,
      invoice_number,
      amount,
      request_id,
    },
  }
}

// sale data with level 2 and level 3 information for FreedomPay cert
function fpay_level3_sale(args={}) {
  const amount = args.amount || '10.00'
  const {request_id} = args

  const invoice_number = get_text_id()
  const customer_id = get_text_id()
  const customer_code = get_text_id()
  const product_code = get_text_id()
  const product_upc = get_text_id()
  const product_sku = get_text_id()
  const product_serial1 = get_text_id()
  const customer_asset_id = get_text_id()
  return {
    sale_request: {
      provider_name: 'freedompay',
      merchant_ref: invoice_number,
      invoice_number,
      amount,
      request_id,
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
  }
}

function fpay_sale(args={}) {
  const amount = args.amount || '10.00'
  const {request_id} = args

  const invoice_number = get_text_id()
  return {
    sale_request: {
      provider_name: 'freedompay',
      merchant_ref: invoice_number,
      invoice_number,
      amount,
      request_id,
    },
  }
}
function fpay_expect_success(t, fields = {}) {
  const {amount, invoice_number} = fields
  const card_issuer = fields.card_issuer || 'VISA'
  const entry_mode = fields.entry_mode || 'swiped'
  return (err, response) => {
    t.error(err)

    //// test dynamic fields
    const {transaction_id, masked_card_number, name_on_card, request_id} = response.response
    const {expiry_date, receipt_text, request_guid} = response.freedompay_response
    t.ok(transaction_id, 'transaction_id')
    t.ok(masked_card_number, 'masked_card_number exists')
    t.equal(masked_card_number.length, 16, 'masked_card_number length')
    t.ok(name_on_card, 'name_on_card')
    t.ok(expiry_date, 'expiry_date')
    t.ok(receipt_text, 'receipt_text')
    t.ok(request_id, 'request_id')

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
        card_issuer,
        request_id,
      },
      freedompay_response: {
        request_guid,
        approved_amount: amount,
        dcc_accepted: 'false',
        decision: 'A',
        error_code: '100',
        msg: 'APPROVED',
        name_on_card,
        issuer_name: card_issuer,
        expiry_date,
        merchant_reference_code: invoice_number,
        entry_mode,
        receipt_text,
        code: '',
        pin_verified: 'false',
        device_verified: 'false',
        signature_required: 'false',
        request_id,
        transaction_id,
      },
      worldpay_response: null
    })
    t.end()
  }
}

function fpay_expect_capture_success(t, fields = {}) {
  const {amount, invoice_number} = fields
  return (err, response) => {
    t.error(err)

    //// test dynamic fields
    const {transaction_id, request_id} = response.response
    const {request_guid} = response.freedompay_response
    t.ok(transaction_id, 'transaction_id')
    t.ok(request_id, 'request_id')
    t.ok(request_guid, 'request_guid')

    t.deepEqual(response, {
      provider_type: 'FREEDOMPAY',
      response: {
        status: 'ACCEPTED',
        error: '',
        sale_amount: amount,
        currency: 'USD',
        masked_card_number: '',
        name_on_card: '',
        transaction_id,
        card_issuer: '',
        request_id,
      },
      freedompay_response: {
        request_guid,
        approved_amount: amount,
        dcc_accepted: 'false',
        decision: 'A',
        error_code: '100',
        msg: 'APPROVED',
        name_on_card: '',
        issuer_name: '',
        expiry_date: '',
        merchant_reference_code: invoice_number,
        entry_mode: '',
        receipt_text: '',
        code: '',
        pin_verified: '',
        device_verified: '',
        signature_required: '',
        request_id,
        transaction_id,
      },
      worldpay_response: null
    })
    t.end()
  }
}

function fpay_expect_user_cancel(t, fields = {}) {
  const {invoice_number} = fields
  return (err, response) => {
    t.error(err)

    //// test dynamic fields
    const {transaction_id, masked_card_number, name_on_card, card_issuer, request_id} = response.response
    const {expiry_date, receipt_text, request_guid} = response.freedompay_response
    t.ok(transaction_id, 'transaction_id')
    t.ok(receipt_text, 'receipt_text')
    t.ok(request_id, 'request_id')

    t.deepEqual(response, {
      provider_type: 'FREEDOMPAY',
      response: {
        status: 'REJECTED',
        error: 'UserCancel',
        sale_amount: '0',
        currency: 'USD',
        masked_card_number: '',
        name_on_card: '',
        transaction_id,
        card_issuer: '',
        request_id,
      },
      freedompay_response: {
        request_guid,
        approved_amount: '0',
        dcc_accepted: 'false',
        decision: 'R',
        error_code: '3133',
        msg: 'UserCancel',
        name_on_card: '',
        issuer_name: '',
        expiry_date: '',
        merchant_reference_code: invoice_number,
        entry_mode: '',
        receipt_text,
        code: '',
        pin_verified: 'false',
        device_verified: 'false',
        signature_required: 'true',
        request_id,
        transaction_id,
      },
      worldpay_response: null
    })
    t.end()
  }
}

// test helpers API
module.exports = {
  standard_boot,
  fpay_standard_config,
  fpay_sale,
  fpay_level1_sale,
  fpay_level3_sale,
  fpay_expect_success,
  fpay_expect_capture_success,
  fpay_expect_user_cancel,
}
