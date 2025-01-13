const { RESTDataSource } = require('@apollo/datasource-rest');

class MovieAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://movie-tracker-socrations.replit.app/api/';
  }

  willSendRequest(_path, request) {
    if (!request.headers) {
      request.headers = {};
    }
    request.headers['Authorization'] = 'Bearer 12345-this-is-secret-token';
  }

  async getMovie(id) {
    return this.get(`movies/search/${id}`);
  }
}

module.exports = MovieAPI;
