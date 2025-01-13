const { RESTDataSource } = require('@apollo/datasource-rest');

class SmartphoneAPI extends RESTDataSource {
  constructor() {
    super();
    // Base URL for the smartphone service
    this.baseURL = 'https://smartphone-rest-socrations.replit.app/api/smartphones/';
  }

  // Override willSendRequest to add authentication
  willSendRequest(path, request) {
    request.headers['Authorization'] = 'Bearer 54321-this-is-secret-token';
  }

  // Get a single smartphone by ID
  async getSmartphone(id) {
    try {
      // Use the new get method with proper error handling
      const response = await this.get(`${id}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      // Validate response
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