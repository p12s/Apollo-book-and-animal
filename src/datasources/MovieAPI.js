const { RESTDataSource } = require('@apollo/datasource-rest');

class MovieAPI extends RESTDataSource {
  constructor() {
    super();
    // Base URL for the movie service
    this.baseURL = 'https://movie-tracker-socrations.replit.app/api/movies';
  }

  // Override willSendRequest to add authentication
  willSendRequest(path, request) {
    request.headers['Authorization'] = 'Bearer 12345-this-is-secret-token';
  }

  // Get a single movie by ID
  async getMovie(id) {
    try {
      console.log(`Fetching movie with ID: ${id}`);

      // Use the new get method with proper error handling
      const response = await this.get(`/${id}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response) {
        throw new Error(`No response received for movie ID ${id}`);
      }

      // Transform and validate the response
      return {
        id: response.id || id,
        name: response.title || 'Unknown Movie',
        brand: response.director || 'Unknown Brand',
        year: response.year || new Date().getFullYear(),
        description: response.genre || null,
        imageUrl: response.posterUrl || null
      };
    } catch (error) {
      console.error(`Error fetching movie ${id}:`, error);
      throw new Error(`Failed to fetch movie: ${error.message}`);
    }
  }
}

module.exports = MovieAPI;