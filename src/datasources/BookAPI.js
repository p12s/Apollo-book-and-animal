const { RESTDataSource } = require('@apollo/datasource-rest');

class BookAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://apollo-tracker-socrations.replit.app/api/';
  }

  willSendRequest(request) {
    const token = this.context.bookAuth;
    request.headers.set('Authorization', `Bearer ${token}`);
  }

  async getBooks() {
    const response = await this.post('graphql', {
      body: {
        query: `
          query {
            books {
              id
              title
              author
              year
            }
          }
        `
      }
    });
    return response.data.books;
  }

  async getBook(id) {
    const response = await this.post('graphql', {
      body: {
        query: `
          query GetBook($id: ID!) {
            book(id: $id) {
              id
              title
              author
              year
            }
          }
        `,
        variables: { id }
      }
    });
    return response.data.book;
  }
}

module.exports = BookAPI;
