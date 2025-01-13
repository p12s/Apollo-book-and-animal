const { RESTDataSource } = require('@apollo/datasource-rest');

class SmartphoneAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://smartphone-rest-socrations.replit.app/api/smartphones/';
    this.httpHeaders = {
      'Authorization': 'Bearer 54321-this-is-secret-token'
    };
  }

  willSendRequest(_path, request) {
    request.headers = this.httpHeaders;
  }

  async getSmartphone(id) {
    return this.get(`${id}`);
  }
}

module.exports = SmartphoneAPI;
