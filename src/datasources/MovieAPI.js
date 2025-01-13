const { RESTDataSource } = require('@apollo/datasource-rest');

class MovieAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://movie-tracker-socrations.replit.app/api/movies';
    this.httpHeaders = {
      'Authorization': 'Bearer 12345-this-is-secret-token'
    };
  }

  willSendRequest(_path, request) {
    request.headers = this.httpHeaders;
  }

  async getMovie(id) {
    try {
      console.log(`Fetching movie with ID: ${id}`);
      const response = await this.get(`/${id}`);
      console.log('Movie API Response:', response);

      if (!response) {
        throw new Error(`No response received for movie ID ${id}`);
      }

      // Transform the response to match our new schema
      return {
        id: response.id || id,
        name: response.title || 'Unknown Movie', // Map title to name
        brand: response.director || 'Unknown Brand', // Map director to brand
        year: response.year || new Date().getFullYear(),
        description: response.genre || null, // Map genre to description
        imageUrl: response.posterUrl || null // Add imageUrl if available
      };
    } catch (error) {
      console.error(`Error fetching movie ${id}:`, error);
      throw new Error(`Failed to fetch movie: ${error.message}`);
    }
  }
}

module.exports = MovieAPI;