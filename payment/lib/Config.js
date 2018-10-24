'use strict';

module.exports = class Config {
  constructor(address, authCredential, authSecret, appId) {
    this.serviceAddress = address;
    this.tpAuthorizationCredential = authCredential; // developer key
    this.tpAuthorizationSecret = authSecret; // developer secret
    this.tpApplicationId = appId;
    this.tpAuthorizationVersion = "1.0";
    this.useJSON = true;
  }
}
