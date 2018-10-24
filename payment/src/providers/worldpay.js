// Implentation for the FREEDOMPAY provider.
const _ = require('lodash')
const request = require('request')
const uuid = require('uuid/v4')
const {parseString} = require('xml2js')
var Config = require('../../lib/Config.js');
var Address = require('../../lib/Address.js');
var SaleRequest = require('../../lib/SaleRequest');
var triPos = require('../../lib/tripos');
const {join} = require('path')

const rel = (...paths) => join(__dirname, '../../', ...paths)
const CONFIG_PATH = rel('docs/triPOS.config')

const DEFAULT_ENVIRONMENT_DESCRIPTION = 'WorldPay 5.15'

Decision_response_map = {
  'Approved': 'ACCEPTED',
  'Success': 'ACCEPTED',  
  'ApprovedByMerchant': 'ACCEPTED',
  'ApprovedExceptCashback': 'ACCEPTED',
  'Declined': 'REJECTED',
  'Restart': 'REJECTED',
  'Cancelled': 'REJECTED',
  'Failed': 'REJECTED',
  'UnknownCard': 'INPUT_ERROR',
  'UnsupportedCard': 'INPUT_ERROR',
  'UseChipReader': 'INPUT_ERROR',
  'UseMagneticStripe': 'INPUT_ERROR',
  'CardRemoved': 'INPUT_ERROR',
  'CardBlocked': 'INPUT_ERROR',
  'CardNotSupported': 'INPUT_ERROR',
  'BadCard': 'INPUT_ERROR'

  /* The rest of these will default to Failed.
  CardError
  ChipError
  PinPadError
  PinPadTimeout
  None
  HostError
  Timeout
  FailedVerification
  DeviceError
  InvalidLane
  SwipedCardIsChipCapable
  ChipReaderError  
  CandidateListEmpty
  IssuerAuthenticationFailed
  CardDataEncryptionNotEnabled
  ApplicationBlocked*/
}

// default to INTERNAL_ERROR if decision was not recognized
const format_status = (Decision) => Decision_response_map[Decision] || 'INTERNAL_ERROR'

const format_response = (done) =>
  (err, body) => {
    if (err || !body) return done(err)

    // standard response fields
    const response = {
      status: format_status(body.statusCode),
      error: map_collection(body._errors, 'exceptionMessage'),
      sale_amount: body.totalAmount,
      transaction_id: body.transactionId,
      masked_card_number: body.accountNumber,
      name_on_card: body.cardHolderName,
      card_issuer: body.cardLogo,
    }

    const worldpay_response = { 
      _errors,
      _hasErrors,
      accountNumber,
      approvalNumber,
      approvalAmount,
      cardHolderName,
      cardLogo,
      entryMode,
      expirationMonth,
      expirationYear,
      isApproved,
      isOffline,
      networkLabel,
      paymentType,
      statusCode,
      totalAmount,
      termianlId,
      transactionDateTime,
      transactionid,
      emv,
      pinVerified,
      _processor    
     } = body;

    done(null, {
      provider_type: 'WORLDPAY',
      response,
      worldpay_response,
    })
  }

  const map_collection = (objects, literal) => {
    return _.map(objects, literal).join("\n");
  }

module.exports = {
  Sale: ({provider_config, request}, done) => {    
    var config = new Config(
      CONFIG_PATH,
      `${provider_config.host}/api/v1/sale`, 
      "1.0"
    );

    let jsonRequest = {
      ...request.worldpay_request,
      transactionAmount: request.sale_request.amount,
    };
    
    triPos.getAuthFromConfig(config.pathToConfig, function(err, credential) {
      if(err) { return done(err); }
  
      config.tpAuthorizationCredential = credential.developerKey;
      config.tpAuthorizationSecret = credential.developerSecret;
      
      triPos.makeSaleRequest(config, jsonRequest, format_response(done));
    });    
  }
}
