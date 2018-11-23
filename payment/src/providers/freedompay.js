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
const convert_to_xml = (object) => _.reduce(object,
  (acc, v, k) => v ? acc.concat(`<${k}>${v}</${k}>`) : acc, [])
  .join('')

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
  return `<Items>${items.map(item_xml).join('')}</Items>`
}

const item_xml = (item) => {
  if (typeof item !== 'object' || _.isEmpty(item)) {
    return ''
  }
  const output = convert_to_xml({
    Id: item.id,
    Tag: item.tag,
    DiscountAmount: item.discount_amount,
    DiscountFlag: item.discount_flag,
    TaxIncludedFlag: item.tax_included_flag,
    ProductCode: item.product_code,
    ProductUpc: item.product_upc,
    ProductSku: item.product_sku,
    ProductName: item.product_name,
    ProductDescription: item.product_description,
    ProductMake: item.product_make,
    ProductModel: item.product_model,
    ProductPart_number: item.product_part_number,
    CommodityCode: item.commodity_code,
    ProductYear: item.product_year,
    ProductSerial1: item.product_serial1,
    ProductSerial2: item.product_serial2,
    ProductSerial3: item.product_serial3,
    CustomerAsset_id: item.customer_asset_id,
    UnitPrice: item.unit_price,
    Quantity: item.quantity,
    TotalAmount: item.total_amount,
    TaxAmount: item.tax_amount,
    PromoCode: item.promo_code,
    FreightAmount: item.freight_amount,
    UnitOfMeasure: item.unit_of_measure,
    SaleCode: item.sale_code,
    CustomFormat_id: item.custom_format_id,
    OrigUnitPrice: item.orig_unit_price,
    OrigTotalAmount: item.orig_total_amount,

  }).concat(custom_xml(item.custom))

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
