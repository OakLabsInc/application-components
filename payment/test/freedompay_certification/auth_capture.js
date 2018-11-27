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

test('should successfully process a capture request', (t) => {
  const {invoice_number, request_id} = shared.sale_data.sale_request

  shared.client.Capture(shared.sale_data, fpay_expect_capture_success(t,
    {amount: '2.01', invoice_number}
  ))
})

test('user should cancel an auth request', (t) => {
  shared.sale_data = fpay_level1_sale({amount: '2.11'})
  const {invoice_number} = shared.sale_data.sale_request

  shared.client.Auth(shared.sale_data, fpay_expect_user_cancel(t, {invoice_number}))
})

test('system should retry an auth request', (t) => {
  const {invoice_number} = shared.sale_data.sale_request

  shared.client.Auth(shared.sale_data, fpay_expect_success(t, {amount: '2.11', invoice_number}))
})

// otherwise the server will keep the process open
// don't know of a way to programmatically stop the GRPC server
// maybe reading documentation would help.  :-)
test('should exit', (t) => {t.end(); process.exit()})
