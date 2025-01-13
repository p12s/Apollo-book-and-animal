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
    try {
      const response = await this.get(`${id}`);

      // Ensure we have the required fields and they're not null
      if (!response || !response.name || !response.brand) {
        throw new Error(`Smartphone with ID ${id} not found or incomplete data`);
      }

      // Transform and validate the response
      return {
        id: response.id || id,
        name: response.name,
        brand: response.brand,
        model: response.model || null,
        year: response.year || 0,
        price: response.price || 0,
        specs: response.specs || null
      };
    } catch (error) {
      console.error(`Error fetching smartphone ${id}:`, error);
      throw error;
    }
  }
}

module.exports = SmartphoneAPI;