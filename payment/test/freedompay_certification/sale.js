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

test('should successfully process a sale request', (t) => {
  const sale_data = fpay_level1_sale({amount: '5.01'})
  const {invoice_number} = sale_data.sale_request

  shared.client.Sale(sale_data, fpay_expect_success(t, {amount: '5.01', invoice_number}))
})

test('user should cancel a sale request', (t) => {
  shared.sale_data = fpay_level1_sale({amount: '5.13'})
  const {invoice_number} = shared.sale_data.sale_request

  shared.client.Sale(shared.sale_data, fpay_expect_user_cancel(t, {invoice_number}))
})

test('system should retry a sale request', (t) => {
  const {invoice_number} = shared.sale_data.sale_request
  shared.client.Sale(shared.sale_data, fpay_expect_success(t,
    {amount: '5.13', invoice_number}
  ))
})


// otherwise the server will keep the process open
// don't know of a way to programmatically stop the GRPC server
// maybe reading documentation would help.  :-)
test('should exit', (t) => {t.end(); process.exit()})
