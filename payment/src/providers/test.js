// Implentation for the TEST provider.
//
// This can be used to test application code in a way that doesn't
// rely on physical peripherals (such as POS, POI devices).
const _ = require('lodash')

module.exports = {
  Sale: ({request}, done) => {
    const {provider_name, amount} = request.sale_request
    return done(null, {
      provider_type: 'TEST',
      response: {
        status: 'ACCEPTED',
        sale_amount: amount,
        masked_card_number: '4111xxxxxxxx5121',
        name_on_card: 'Thomas Jefferson',
      }
    })
  }
}
