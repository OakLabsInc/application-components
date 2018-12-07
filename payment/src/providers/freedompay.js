// Implentation for the FREEDOMPAY provider.
const _ = require('lodash')
const request = require('request')
const uuid = require('uuid/v4')
const {parseString} = require('xml2js')

const {version} = require('../../package.json')
const DEFAULT_ENVIRONMENT_DESCRIPTION = 'OakOS Payment v' + version
const debug = require('debug')('freedompay')

function fpay_request(provider_config, xml, response_field, done) {
  const {host} = provider_config
  debug(xml)
  request({
    uri: host,
    method: 'POST',
    body: xml,
  }, format_response(response_field, done))
}

const Decision_response_map = {
  'A': 'ACCEPTED',
  'R': 'REJECTED',
  'F': 'INTERNAL_ERROR',
  'E': 'INPUT_ERROR',
}
// default to INTERNAL_ERROR if decision was not recognized
const format_status = (Decision) => Decision_response_map[Decision] || Decision_response_map['F']

const format_response = (response_field = 'response', done) =>
  (err, res, body) => {
    if (err || !body) return done(err)
    const {statusCode, headers} = res
    debug(body)
    parseString(body, {explicitArray: false}, (err, fpay_response) => {
      if (err) return done(err)
      const {POSResponse: {
        Decision,
        RequestGuid,
        TransactionId,
        RequestId,
        ApprovedAmount,
        DCCAccepted,
        ErrorCode,
        Message,
        IssuerName,
        MaskedCardNumber,
        NameOnCard,
        ExpiryDate,
        MerchantReferenceCode,
        EntryMode,
        ReceiptText,
        Code,
        PinVerified,
        DeviceVerified,
        SignatureRequired,
      }} = fpay_response
      debug('%o', {RequestId})
      //debug('%O', {RequestId, Decision, status: format_status(Decision)})

      // standard response fields
      const response = {
        status: format_status(Decision),
        error: _.includes(['R', 'F', 'E'], Decision) ? Message : '',
        sale_amount: ApprovedAmount,
        transaction_id: TransactionId,
        masked_card_number: MaskedCardNumber,
        name_on_card: NameOnCard,
        card_issuer: IssuerName,
        request_id: RequestId,
      }

      // freedompay specific fields
      const freedompay_response = {
        request_guid: RequestGuid,
        transaction_id: TransactionId,
        request_id: RequestId,
        approved_amount: ApprovedAmount,
        dcc_accepted: DCCAccepted,
        decision: Decision,
        error_code: ErrorCode,
        msg: Message,
        name_on_card: NameOnCard,
        issuer_name: IssuerName,
        expiry_date: ExpiryDate,
        merchant_reference_code: MerchantReferenceCode,
        entry_mode: EntryMode,
        receipt_text: ReceiptText,
        code: Code,
        pin_verified: PinVerified,
        device_verified: DeviceVerified,
        signature_required: SignatureRequired,
      }
      const result = {
        provider_type: 'FREEDOMPAY',
        freedompay_response,
      }
      result[response_field] = response

      done(null, result)
    })
  }

// only include keys that have non null values
const convert_to_xml = (object, ns) => {
  const xmlns = ns ? ` xmlns="${ns}"` : ''
  return _.reduce(object,
    (acc, v, k) => v ? acc.concat(`<${k}${xmlns}>${v}</${k}>`) : acc, [])
    .join('')
}

const freedompay_xml = (provider_config, request, RequestType, request_prop) => {

  // set defaults and
  RequestType || (RequestType = 'Sale')
  request_prop || (request_prop = 'sale_request')
  const std_request = request[request_prop] || {}
  const freedompay_request = request.freedompay_request || {}

  // collect the fields that we want to use
  const environment_description = provider_config.environment_description || DEFAULT_ENVIRONMENT_DESCRIPTION
  const location_id = std_request.location_id || provider_config.location_id
  const terminal_id = std_request.terminal_id || provider_config.terminal_id
  const {amount, merchant_ref, invoice_number, request_id} = std_request
  const {
    client_environment,
    lane_id,
    purchase_info,
    items
  } = freedompay_request

  const {
    customer_po_number,
    customer_po_date,
    customer_id,
    customer_code,
  } = purchase_info || {}

  const Items = items_xml(items)

  // create the output XML elements
  const fields = convert_to_xml({
    RequestType,
    RequestGuid: uuid(),
    RequestId: request_id,
    ClientEnvironment: 'OakOS',
    ChargeAmount: amount,
    StoreId: location_id,
    TerminalId: terminal_id,
    MerchantReferenceCode: merchant_ref,
    ClientEnvironment: environment_description,
    InvoiceNumber: invoice_number,
    LaneId: lane_id,
    CustomerPoNumber: customer_po_number,
    CustomerPoDate: customer_po_date,
    CustomerId: customer_id,
    CustomerCode: customer_code,
    Items,
  })

  // wrap in root tag
  const xml = `<POSRequest>${fields}</POSRequest>`
  return xml
}

const items_xml = (items) => {
  if (!Array.isArray(items)) return null
  return items.map(item_xml).join('')
}

// The FreedomPay XML parser:
// 1) silently ignores all of these fields if they don't have the xmlns property correct
// 2) appears to crash and drop the socket connection if there are any misspellings or
//   capitalizations incorrect in the field names
// 3) Fails with an internal error with no details in the response if the value is in an
//   incorrect format (e.g. string too long)
const item_xml = (item) => {
  if (typeof item !== 'object' || _.isEmpty(item)) {
    return ''
  }
  const output = convert_to_xml({
    id: item.id,
    tag: item.tag,
    discountAmount: item.discount_amount,
    discountFlag: item.discount_flag,
    taxIncludedFlag: item.tax_included_flag,
    productCode: item.product_code,
    productUpc: item.product_upc,
    productSKU: item.product_sku,
    productName: item.product_name,
    productDescription: item.product_description,
    productMake: item.product_make,
    productModel: item.product_model,
    productPartNumber: item.product_part_number,
    commodityCode: item.commodity_code,
    productYear: item.product_year,
    productSerial1: item.product_serial1,
    productSerial2: item.product_serial2,
    productSerial3: item.product_serial3,
    customerAssetId: item.customer_asset_id,
    unitPrice: item.unit_price,
    quantity: item.quantity,
    totalAmount: item.total_amount,
    taxAmount: item.tax_amount,
    promoCode: item.promo_code,
    freightAmount: item.freight_amount,
    unitOfMeasure: item.unit_of_measure.slice(0, 3),
    saleCode: item.sale_code,
    customFormatId: item.custom_format_id,
    origUnitPrice: item.orig_unit_price,
    origTotalAmount: item.orig_total_amount,

  }, 'http://freeway.freedompay.com/').concat(custom_xml(item.custom))

  return `<Item>${output}</Item>`
}

const custom_xml = (custom) => {
  if (!Array.isArray(custom)) return null
  return custom.map((field, index) =>
    `<Custom${index}>${field}</Custom${index}>`
  ).join('')
}

module.exports = {
  Sale: ({provider_config, request}, done) => {
    const xml = freedompay_xml(provider_config, request, 'Sale')
    fpay_request(provider_config, xml, 'response', done)
  },
  Auth: ({provider_config, request}, done) => {
    const xml = freedompay_xml(provider_config, request, 'Auth')
    fpay_request(provider_config, xml, 'response', done)
  },
  Capture: ({provider_config, request}, done) => {
    const xml = freedompay_xml(provider_config, request, 'Capture')
    fpay_request(provider_config, xml, 'response', done)
  },
  Cancel: ({provider_config, request}, done) => {
    const xml = freedompay_xml(provider_config, request, 'Cancel')
    fpay_request(provider_config, xml, 'response', done)
  }
}
