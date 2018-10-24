const {test} = require('tape')

const grpc = require('grpc')
const {inspect} = require('util')
const torch = require('torch')
const uuid = require('uuid/v4')

const paymentService = require('../src')
const {PROTO_PATH} = paymentService
const host = '0.0.0.0:8000'
const WORLDPAY_HOST = 'http://192.168.0.64:8080'

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


test('info should return not configured', (t) => {
  client.Info({}, (err, info) => {
    t.error(err)
    t.deepEqual(info, {configured: false, configuration: null})
    t.end()
  })
})


test('should configure the worldpay service', (t) => {
  client.Configure({
    providers: [{
      provider_name: 'worldpay',
      provider_type: 'WORLDPAY',
      host: WORLDPAY_HOST,
    }]
  }, (err) => {
    t.error(err)
    t.end()
  })
})

/* will refactor required fields after certification
test('should configure the service with all required fields', (t) => {
  client.Configure({
    providers: [{
      provider_name: 'worldpay',
      provider_type: 'WORLDPAY',
      host: WORLDPAY_HOST,
      terminal_id: '2',
    }]
  }, (err) => {
    t.error(err)
    t.end()
  })
})
*/

test('info should return configured', (t) => {
  client.Info({}, (err, info) => {
    t.error(err)
    t.deepEqual(info, {
      configured: true,
      configuration: {
        providers: [
          {
            provider_name: 'worldpay',
            provider_type: 'WORLDPAY',
            solution: 'DEFAULT',
            host: WORLDPAY_HOST,
            api_id: '',
            api_key: '',
            batch_interval: 'OFF',            
            batch_hour: 0,
            location_id: '',
            terminal_id: '',
            environment_description: ''
          }
        ]
      }
    })
    t.end()
  })
})


test('should fail to process a sale without a laneId', (t) => {
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 10.50
    }
  }, (err, response) => {
    t.error(err)
    t.ok(response.worldpay_response._hasErrors)
    t.notOk(response.worldpay_response.isApproved)
    t.end()
  })
})

test('should fail to process a sale without a valide laneId', (t) => {
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 10.50
    }, worldpay_request: { 
      laneId: 100,
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: uuid(),
      configuration: {
          allowPartialApprovals: false,
          checkForDuplicateTransactions: false,
      }
    }
  }, (err, response) => {
    t.error(err)
    t.ok(response.worldpay_response._hasErrors)
    t.equal(response.response.error, 'Could not find a PIN pad tethered to the lane specified in the request: 100')
    t.notOk(response.worldpay_response.isApproved)
    t.end()
  })
})


let ticketNumber = 1
const get_invoice_number = () => ticketNumber++

test('should not accept a invalid sale amount value', (t) => {
  t.throws(() => {
    let mref = uuid()
    const invoice_number = get_invoice_number()
    client.Sale({
      sale_request: {
        provider_name: 'worldpay',
        amount: 'abc'
      }, worldpay_request: { 
        laneId: 2,
        ticketNumber: ticketNumber.toString().padStart(10, '0'),
        referenceNumber: mref,
        configuration: {
            allowPartialApprovals: false,
            checkForDuplicateTransactions: false,
        }
      }
    }, (err, response) => {
      t.error(err)
      t.end()
    })  
  })

  t.end()
})


test('should not approve on a cancel. (Cancelled pressed on terminal)', (t) => {  
  let mref = uuid()
  const invoice_number = get_invoice_number()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 20
    }, worldpay_request: { 
      laneId: 2,
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref,
      configuration: {
          allowPartialApprovals: false,
          checkForDuplicateTransactions: false,
      }
    }
  }, (err, response) => {
    t.error(err)
    t.notOk(response.worldpay_response.isApproved)
    t.equal(response.response.status, `REJECTED`)
    t.equal(response.worldpay_response.statusCode, `Cancelled`)
    t.end()
  })  
})

test('should not approve on a cancel. (Cancelled pressed on when confirming amount)', (t) => {  
  let mref = uuid()
  const invoice_number = get_invoice_number()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 20
    }, worldpay_request: { 
      laneId: 2,
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref,
      configuration: {
          allowPartialApprovals: false,
          checkForDuplicateTransactions: false,
      }
    }
  }, (err, response) => {
    t.error(err)
    t.notOk(response.worldpay_response.isApproved)
    t.equal(response.response.status, `REJECTED`)
    t.equal(response.worldpay_response.statusCode, `Cancelled`)
    t.end()
  })  
})

test('should decline a transaction.', (t) => {  
  let mref = uuid()
  const invoice_number = get_invoice_number()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: .20
    }, worldpay_request: { 
      laneId: 2,
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref,
      configuration: {
          allowPartialApprovals: false,
          checkForDuplicateTransactions: false,
      }
    }
  }, (err, response) => {
    t.error(err)
    t.notOk(response.worldpay_response.isApproved)
    t.equal(response.response.status, `REJECTED`)
    t.equal(response.worldpay_response.statusCode, `Failed`)
    t.end()
  })  
})

test('should decline on a partial approval.', (t) => {  
  let mref = uuid()
  const invoice_number = get_invoice_number()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 23.05
    }, worldpay_request: { 
      laneId: 2,
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref,
      configuration: {
          allowPartialApprovals: false,
          checkForDuplicateTransactions: false,
      }
    }
  }, (err, response) => {
    t.error(err)
    t.notOk(response.worldpay_response.isApproved)
    t.equal(response.response.status, `REJECTED`)
    t.equal(response.worldpay_response.statusCode, `Failed`)
    t.end()
  })  
})

test('should approve on a partial approval when allowPartialApprovals set to true.', (t) => {  
  let mref = uuid()
  const invoice_number = get_invoice_number()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 23.05
    }, worldpay_request: { 
      laneId: 2,
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref,
      configuration: {
          allowPartialApprovals: true,
          checkForDuplicateTransactions: false,
      }
    }
  }, (err, response) => {
    t.error(err)
    t.ok(response.worldpay_response.isApproved)
    t.equal(response.response.status, `ACCEPTED`)
    t.end()
  })  
})

test('should decline on an expired credit card.', (t) => {  
  let mref = uuid()
  const invoice_number = get_invoice_number()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: .21
    }, worldpay_request: { 
      laneId: 2,
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref,
      configuration: {
          allowPartialApprovals: false,
          checkForDuplicateTransactions: false,
      }
    }
  }, (err, response) => {
    t.error(err)
    t.notOk(response.worldpay_response.isApproved)
    t.equal(response.response.status, `REJECTED`)
    t.equal(response.worldpay_response.statusCode, `Failed`)
    t.end()
  })  
})

test('should decline on an duplicate transaction with flag set to check for duplicates.', (t) => {  
  let mref = uuid()
  const invoice_number = get_invoice_number()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: .22
    }, worldpay_request: { 
      laneId: 2,
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref,
      configuration: {
          allowPartialApprovals: false,
          checkForDuplicateTransactions: true,
      }
    }
  }, (err, response) => {
    t.error(err)
    t.notOk(response.worldpay_response.isApproved)
    t.equal(response.response.status, `REJECTED`)
    t.equal(response.worldpay_response.statusCode, `Failed`)
    t.end()
  })  
})

test('should approve on a duplicate transaction when checkForDuplicateTransactions set to false.', (t) => {  
  let mref = uuid()
  const invoice_number = get_invoice_number()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: .22
    }, worldpay_request: { 
      laneId: 2,
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref,
      configuration: {
          allowPartialApprovals: false,
          checkForDuplicateTransactions: false,
      }
    }
  }, (err, response) => {
    t.error(err)
    t.ok(response.worldpay_response.isApproved)
    t.equal(response.response.status, `ACCEPTED`)
    t.end()
  })  
})


test('should successfully process a sale', (t) => {
  let mref = uuid()
  const invoice_number = get_invoice_number()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 1
    }, worldpay_request: { 
      laneId: 2,
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref,
      configuration: {
          allowPartialApprovals: false,
          checkForDuplicateTransactions: false,
      }
    }
  }, (err, response) => {
    t.error(err)

    t.ok(response.worldpay_response.isApproved);    
    t.end()
  })
})

test('should not approve on a timeout. (Let the machine timeout by not swiping card)', (t) => {  
  let mref = uuid()
  const invoice_number = get_invoice_number()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 20
    }, worldpay_request: { 
      laneId: 2,
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref,
      configuration: {
          allowPartialApprovals: false,
          checkForDuplicateTransactions: false,
      }
    }
  }, (err, response) => {
    t.error(err)
    t.notOk(response.worldpay_response.isApproved)
    t.equal(response.response.status, `INTERNAL_ERROR`)
    t.end()
  })  
})


// otherwise the server will keep the process open
// don't know of a way to programmatically stop the GRPC server
// maybe reading documentation would help.  :-)
test('should exit', (t) => {t.end(); process.exit()})
