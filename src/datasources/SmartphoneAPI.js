const { RESTDataSource } = require('@apollo/datasource-rest');

class SmartphoneAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://smartphone-rest-socrations.replit.app/api/';
  }

  willSendRequest(_path, request) {
    if (!request.headers) {
      request.headers = {};
    }
    request.headers['Authorization'] = 'Bearer 54321-this-is-secret-token';
  }

  async getSmartphone(id) {
    return this.get(`smartphones/${id}`);
  }
}

module.exports = SmartphoneAPI;
