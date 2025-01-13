const { RESTDataSource } = require('@apollo/datasource-rest');

class MovieAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://movie-tracker-socrations.replit.app/api/movies/search/';
    this.httpHeaders = {
      'Authorization': 'Bearer 12345-this-is-secret-token'
    };
  }

  willSendRequest(_path, request) {
    request.headers = this.httpHeaders;
  }

  async getMovie(id) {
    return this.get(`${id}`);
  }
}

module.exports = MovieAPI;
