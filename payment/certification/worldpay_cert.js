const grpc = require('grpc');
const uuid = require('uuid/v4')

const paymentService = require('../src')
const {PROTO_PATH} = paymentService
const host = '0.0.0.0:8000'
const WORLDPAY_HOST = 'http://192.168.0.64:8080'


let client, ticketNumber = 1
const get_invoice_number = () => ticketNumber++

const service = paymentService({host}, () => {
    const {Payment} = grpc.load(PROTO_PATH).oak.platform
    client = new Payment(host, grpc.credentials.createInsecure())
    client.Configure({
        providers: [{
          provider_name: 'worldpay',
          provider_type: 'WORLDPAY',
          host: WORLDPAY_HOST,
        }]
      }, () => {
        client.Info({}, (err, status) => {
            /*console.log('triPOS Restaurant Sale CP Swiped Credit Card');
            client.Sale({
                sale_request: {
                    provider_name: 'worldpay',
                    amount: 1,
                },
                worldpay_request: { 
                    laneId: 2,
                    ticketNumber: get_invoice_number().toString().padStart(10, '0'),
                    referenceNumber: uuid(),
                    configuration: {
                        allowPartialApprovals: true,
                        checkForDuplicateTransactions: true,
                        marketCode: 'Retail',
                    }
                }
            }, (err, response) => {
                console.log([err, response.worldpay_response]);
                console.log('------------------------------------------')
            });*/

            /*console.log('triPOS Restaurant Sale CP Swiped PIN Debit');
            client.Sale({
                sale_request: {
                    provider_name: 'worldpay',
                    amount: 31,
                },
                worldpay_request: { 
                    laneId: 2,
                    ticketNumber: get_invoice_number().toString().padStart(10, '0'),
                    referenceNumber: uuid(),
                    configuration: {
                        allowPartialApprovals: false,
                        checkForDuplicateTransactions: false,
                        marketCode: 'Retail',
                    }
                }
            }, (err, response) => {
                console.log([err, response.worldpay_response]);
                console.log('------------------------------------------')
            });*/

            
            /*console.log('triPOS Restaurant Sale CP EMV Card insert');
            client.Sale({
                sale_request: {
                    provider_name: 'worldpay',
                    amount: 1,
                },
                worldpay_request: { 
                    laneId: 2,
                    ticketNumber: get_invoice_number().toString().padStart(10, '0'),
                    referenceNumber: uuid(),
                    configuration: {
                        allowPartialApprovals: false,
                        checkForDuplicateTransactions: false,
                        marketCode: 'Retail',
                    }
                }
            }, (err, response) => {
                console.log([err, response, response.worldpay_response]);
                console.log('------------------------------------------')
            });*/
            

            
            /*console.log('triPOS Restaurant Sale Process Duplicate Sale Transactions');
            client.Sale({
                sale_request: {
                    provider_name: 'worldpay',
                    amount: 23.05,
                },
                worldpay_request: { 
                    laneId: 2,
                    ticketNumber: get_invoice_number().toString().padStart(10, '0'),
                    referenceNumber: uuid(),
                    configuration: {
                        allowPartialApprovals: false,
                        checkForDuplicateTransactions: false,
                        marketCode: 'Retail',
                    }
                }
            }, (err, response) => {
                console.log([err, response.worldpay_response]);
                console.log('------------------------------------------')
            });*/

            /*console.log('triPOS Retail Sale CP Swiped Credit Card ' + ticketNumber);
            client.Sale({
                sale_request: {
                    provider_name: 'worldpay',
                    amount: 1,
                },
                worldpay_request: { 
                    laneId: 2,
                    ticketNumber: get_invoice_number().toString().padStart(10, '0'),
                    referenceNumber: uuid(),
                    configuration: {
                        allowPartialApprovals: false,
                        checkForDuplicateTransactions: false,
                    }
                }
            }, (err, response) => {
                console.log([err, response.worldpay_response]);
                console.log('------------------------------------------')
            });*/

            
            /*console.log('triPOS Retail Sale CP Swiped PIN Debit ' + ticketNumber);
            client.Sale({
                sale_request: {
                    provider_name: 'worldpay',
                    amount: 31,
                },
                worldpay_request: { 
                    laneId: 2,
                    ticketNumber: get_invoice_number().toString().padStart(10, '0'),
                    referenceNumber: uuid(),
                    configuration: {
                        allowPartialApprovals: true,
                        checkForDuplicateTransactions: true,
                    }
                }
            }, (err, response) => {
                console.log([err, response.worldpay_response]);
                console.log('------------------------------------------')
            });*/
            



           /*console.log('triPOS Retail Sale CP EMV Card insert');
           client.Sale({
               sale_request: {
                   provider_name: 'worldpay',
                   amount: 1,
               },
               worldpay_request: { 
                   laneId: 2,
                   ticketNumber: get_invoice_number().toString().padStart(10, '0'),
                   referenceNumber: uuid(),
                   configuration: {
                       allowPartialApprovals: false,
                       checkForDuplicateTransactions: false,
                   }
               }
           }, (err, response) => {
               console.log([err, response, response.worldpay_response]);
               console.log('------------------------------------------')
           });*/

                      
            /*console.log('triPOS Retail Sale Process Duplicate Sale Transactions ' + ticketNumber);
            client.Sale({
                sale_request: {
                    provider_name: 'worldpay',
                    amount: 1,
                },
                worldpay_request: { 
                    laneId: 2,
                    ticketNumber: get_invoice_number().toString().padStart(10, '0'),
                    referenceNumber: uuid(),
                    configuration: {
                        allowPartialApprovals: false,
                        checkForDuplicateTransactions: false,
                    }
                }
            }, (err, response) => {
                console.log([err, response.worldpay_response]);
                console.log('------------------------------------------')
            });*/

            
            // used for testing to return what test values should be expected
            client.Sale({
                sale_request: {
                    provider_name: 'worldpay',
                    amount: 1
                },
                worldpay_request: { 
                    laneId: 2,
                    ticketNumber: get_invoice_number().toString().padStart(10, '0'),
                    referenceNumber: uuid(),
                    configuration: {
                        allowPartialApprovals: false,
                        checkForDuplicateTransactions: true,
                    }
                }
            }, (err, response) => {
                console.log([err, response]);
            });
            
        })
      })
});

