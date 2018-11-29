// Implentation for the FREEDOMPAY provider.
const _ = require('lodash')
const request = require('request')
const uuid = require('uuid/v4')
const {parseString} = require('xml2js')
const Config = require('../../lib/Config.js');
const triPos = require('../../lib/tripos');

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

  /* The rest of these will default to INTERNAL_ERROR.
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
      approvedAmount,
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

const sale_request = (provider_config, {sale_request, worldpay_request}) => {
  worldpay_request || (worldpay_request = {})
  const fields = {
    laneId: provider_config.lane_id,
    transactionAmount: sale_request.amount,
    referenceNumber: worldpay_request.referenceNumber || '',
    ticketNumber: worldpay_request.ticketNumber || '',
    configuration: configuration_request(worldpay_request)
  };

  return fields;
};

const configuration_request = ({configuration}) => {
  configuration || (configuration = {})
  const fields = {
    checkForDuplicateTransactions: configuration.checkForDuplicateTransactions || false,
    allowPartialApprovals: configuration.allowPartialApprovals || false,
    marketCode: configuration.marketCode || 'QSR'
  };

  return fields;
}

module.exports = {
  Sale: ({provider_config, request}, done) => {
    const config = new Config(
      `${provider_config.host}/api/v1/sale`,
      provider_config.api_id,
      provider_config.api_key,
      provider_config.application_id
    );

    const json = sale_request(provider_config, request);

    console.log(json);

    triPos.makeSaleRequest(config, json, format_response(done));
  }
}
