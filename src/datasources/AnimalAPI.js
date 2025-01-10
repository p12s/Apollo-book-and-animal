const { RESTDataSource } = require('@apollo/datasource-rest');

class AnimalAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://apollo-animal-socrations.replit.app/';
  }

  willSendRequest(_path, request) {
    const token = this.context?.animalAuth;
    if (!request.headers) {
      request.headers = {};
    }
    request.headers['Authorization'] = `Bearer ${token}`;
  }

  async getAnimals() {
    const response = await this.post('graphql', {
      body: {
        query: `
          query {
            animals {
              id
              name
              species
              age
              diet
              habitat
              health_status
            }
          }
        `
      }
    });
    return response.data.animals;
  }

  async getAnimal(id) {
    const response = await this.post('graphql', {
      body: {
        query: `
          query GetAnimal($id: Int!) {
            animal(id: $id) {
              id
              name
              species
              age
              diet
              habitat
              health_status
            }
          }
        `,
        variables: { id: parseInt(id) }
      }
    });
    return response.data.animal;
  }
}

module.exports = AnimalAPI;