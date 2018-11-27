const {
  standard_boot,
  fpay_standard_config,
  fpay_level1_sale,
  fpay_expect_success,
  fpay_expect_capture_success,
  fpay_expect_user_cancel,
} = require('../helpers')

const debug = require('debug')('test')
const {test} = require('tape')

// declare variables shared between tests
const shared = {}

// boot server and client, attach to shared.client
standard_boot(test, shared)

// configure server and check info to make sure everything is good
fpay_standard_config(test, shared)

test('should successfully process an auth request', (t) => {
  shared.sale_data = fpay_level1_sale({amount: '2.01'})
  const {invoice_number} = shared.sale_data.sale_request

  shared.client.Auth(shared.sale_data, (err, response) => {
    shared.sale_data.sale_request.request_id = response.response.request_id
    fpay_expect_success(t, {amount: '2.01', invoice_number})(err, response)
  })
})

test('system should cancel an auth request', (t) => {
  shared.client.Cancel(shared.sale_data, (err, response) => {
    t.error(err)

    //// test dynamic fields
    const {status, error} = response.response
    const {request_guid} = response.freedompay_response

    t.deepEqual(response, {
      provider_type: 'FREEDOMPAY',
      response: {
        status: 'ACCEPTED',
        error: '',
        sale_amount: '0',
        currency: 'USD',
        masked_card_number: '',
        name_on_card: '',
        transaction_id: '',
        card_issuer: '',
        request_id: ''
      },
      freedompay_response: {
        request_guid,
        approved_amount: '0',
        dcc_accepted: 'false',
        decision: 'A',
        error_code: '100',
        msg: 'ACCEPT',
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
        transaction_id: ''
      },
      worldpay_response: null
    })
    t.end()
  })
})


// otherwise the server will keep the process open
// don't know of a way to programmatically stop the GRPC server
// maybe reading documentation would help.  :-)
test('should exit', (t) => {t.end(); process.exit()})
