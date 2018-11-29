require('dotenv').config()
const {
  HOST,
  FREEDOMPAY_HOST,
  WORLDPAY_HOST,
} = process.env

const {test} = require('tape')

const grpc = require('grpc')
const {inspect} = require('util')
const torch = require('torch')
const uuid = require('uuid/v4')

const paymentService = require('../src')
const {PROTO_PATH} = paymentService

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


test('should not configure the service without required worldpay fields', (t) => {
  client.Configure({
    providers: [{
      provider_name: 'worldpay',
      provider_type: 'WORLDPAY',
      host: WORLDPAY_HOST,
    }]
  }, (err) => {
    t.ok(err)
    t.equal(err.message, `2 UNKNOWN: Invalid payment configuration:
WORLDPAY provider config #1 missing required field api_id
WORLDPAY provider config #1 missing required field api_key
WORLDPAY provider config #1 missing required field application_id
WORLDPAY provider config #1 missing required field lane_id`)
    t.end()
  })
})

test('should throw an error with an invalid lane id passed', (t) => {
  t.throws(() => {
    client.Configure({
      providers: [{
        provider_name: 'worldpay',
        provider_type: 'WORLDPAY',
        host: WORLDPAY_HOST,
        lane_id: '2',
      }]
    }, (err) => {
      t.ok(err)
      t.end()
    })
  })

  t.end()
})

test('should throw an error with an invalid application id passed', (t) => {
  t.throws(() => {
    client.Configure({
      providers: [{
        provider_name: 'worldpay',
        provider_type: 'WORLDPAY',
        host: WORLDPAY_HOST,
        application_id: '9573',
      }]
    }, (err) => {
      t.ok(err)
      t.end()
    })
  })

  t.end()
})


let id = uuid();
let key = uuid();

test('should configure the service with all required fields', (t) => {
  client.Configure({
    providers: [{
      provider_name: 'worldpay',
      provider_type: 'WORLDPAY',
      host: WORLDPAY_HOST,
      api_id: id,
      api_key: key,
      application_id: 9573,
      lane_id: 2,
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
            provider_name: 'worldpay',
            provider_type: 'WORLDPAY',
            solution: 'DEFAULT',
            host: WORLDPAY_HOST,
            api_id: id,
            api_key: key,
            batch_interval: 'OFF',
            batch_hour: 0,
            location_id: '',
            terminal_id: '',
            environment_description: '',
            application_id: 9573,
            lane_id: 2
          }
        ]
      }
    })
    t.end()
  })
})

test('should fail with an internal error when an invalid developer key is supplied', (t) => {
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 10.50
    }
  }, (err, response) => {
    t.error(err)
    t.ok(response.worldpay_response._hasErrors)
    t.equal(response.response.status, 'INTERNAL_ERROR')
    t.equal(response.response.error, 'Invalid developer account')
    t.end()
  })
})

test('should fail with an internal error when an invalid developer secret is supplied', (t) => {
  id = 'bbdcd0b1-61ea-4d89-a16c-c843833bed39'; // set correct developer key from tripos.config service

  client.Configure({
    providers: [{
      provider_name: 'worldpay',
      provider_type: 'WORLDPAY',
      host: WORLDPAY_HOST,
      lane_id: 2,
      api_id: id,
      api_key: key,
      application_id: 9573
    }]
  }, () => {
    client.Sale({
      sale_request: {
        provider_name: 'worldpay',
        amount: 10.50
      }
    }, (err, response) => {
      t.error(err)
      t.ok(response.worldpay_response._hasErrors)
      t.equal(response.response.status, 'INTERNAL_ERROR')
      t.notEqual(response.response.error, 'Invalid developer account')
      t.end()
    })
  })
})

test('should successfully process a sale', (t) => {
  key = 'a7a33930-6d7e-4d1a-88b6-8971f0db3edf' // set correct developer secret from tripos.config service

  client.Configure({
    providers: [{
      provider_name: 'worldpay',
      provider_type: 'WORLDPAY',
      host: WORLDPAY_HOST,
      lane_id: 2,
      api_id: id,
      api_key: key,
      application_id: 9573
    }]
  }, () => {
    let mref = uuid()
    const invoice_number = uuid()
    client.Sale({
      sale_request: {
        provider_name: 'worldpay',
        amount: 1
      }, worldpay_request: {
        ticketNumber: ticketNumber.toString().padStart(10, '0'),
        referenceNumber: mref
      }
    }, (err, response) => {
      t.error(err)
      t.ok(response.worldpay_response.isApproved);
      t.end()
    })
  })
})


test('should not accept a invalid sale amount value', (t) => {
  t.throws(() => {
    let mref = uuid()
    const invoice_number = uuid()
    client.Sale({
      sale_request: {
        provider_name: 'worldpay',
        amount: 'abc'
      }, worldpay_request: {
        ticketNumber: ticketNumber.toString().padStart(10, '0'),
        referenceNumber: mref
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
  const invoice_number = uuid()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 20
    }, worldpay_request: {
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref
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
  const invoice_number = uuid()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 20
    }, worldpay_request: {
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref
    }
  }, (err, response) => {
    t.error(err)
    t.notOk(response.worldpay_response.isApproved)
    t.equal(response.response.status, `REJECTED`)
    t.equal(response.worldpay_response.statusCode, `Cancelled`)
    t.end()
  })
})


test('should not approve when a chip is removed while processing. (remove chip after confirming amount)', (t) => {
  let mref = uuid()
  const invoice_number = uuid()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 20
    }, worldpay_request: {
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref
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
  const invoice_number = uuid()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: .20
    }, worldpay_request: {
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref
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
  const invoice_number = uuid()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 23.05
    }, worldpay_request: {
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref
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
  const invoice_number = uuid()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 23.05
    }, worldpay_request: {
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref,
      configuration: {
          allowPartialApprovals: true,
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
  const invoice_number = uuid()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: .21
    }, worldpay_request: {
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref
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
  const invoice_number = uuid()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: .22
    }, worldpay_request: {
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref,
      configuration: {
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
  const invoice_number = uuid()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: .22
    }, worldpay_request: {
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref,
    }
  }, (err, response) => {
    t.error(err)
    t.ok(response.worldpay_response.isApproved)
    t.equal(response.response.status, `ACCEPTED`)
    t.end()
  })
})

test('should not approve on a timeout. (Let the machine timeout by not swiping card)', (t) => {
  let mref = uuid()
  const invoice_number = uuid()
  client.Sale({
    sale_request: {
      provider_name: 'worldpay',
      amount: 20
    }, worldpay_request: {
      ticketNumber: ticketNumber.toString().padStart(10, '0'),
      referenceNumber: mref
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
