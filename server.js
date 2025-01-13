const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { RESTDataSource } = require('@apollo/datasource-rest');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { json } = require('body-parser');
const { readFileSync } = require('fs');

class MovieAPI extends RESTDataSource {
  baseURL = 'https://movie-tracker-socrations.replit.app/api/movies';

  constructor() {
    super();
    this.baseURL = 'https://movie-tracker-socrations.replit.app/api/movies';
  }

  willSendRequest(path, request) {
    request.headers = {
      ...request.headers,
      'Authorization': 'Bearer 12345-this-is-secret-token'
    };
  }

  async getMovie(id) {
    const data = await this.get(`/search/${id}`);
    return {
      id: data.id,
      name: data.title,
      brand: data.director,
      year: data.year,
      description: data.genre,
      imageUrl: data.posterUrl
    };
  }

  async getMovies() {
    const response = await this.get(`/search`);
    return response.map(movie => ({
      id: movie.id,
      name: movie.title,
      brand: movie.director,
      year: movie.year,
      description: movie.genre,
      imageUrl: movie.posterUrl
    }));
  }
}

class SmartphoneAPI extends RESTDataSource {
  baseURL = 'https://smartphone-rest-socrations.replit.app/api/smartphones';

  constructor() {
    super();
    this.baseURL = 'https://smartphone-rest-socrations.replit.app/api/smartphones';
  }

  willSendRequest(path, request) {
    request.headers = {
      ...request.headers,
      'Authorization': 'Bearer 54321-this-is-secret-token'
    };
  }

  formatSmartphone(data) {
    return {
      id: data.id,
      name: data.name || 'Unknown Name',
      brand: data.manufacturer || 'Unknown Brand', // Ensure brand is never null
      model: data.model,
      year: data.releaseYear || new Date().getFullYear(),
      price: parseFloat(data.price) || 0.0,
      specs: data.specifications || ''
    };
  }

  async getSmartphone(id) {
    const data = await this.get(`/${id}`);
    return this.formatSmartphone(data);
  }

  async getSmartphones() {
    const response = await this.get('/');
    return response.map(phone => this.formatSmartphone(phone));
  }
}

// Read schema file
try {
  console.log('Reading schema file...');
  const typeDefs = readFileSync('./schema.graphql', 'utf8');
  console.log('Schema file loaded successfully');

  async function startApolloServer() {
    try {
      console.log('Initializing Apollo Server...');
      const app = express();
      const httpServer = http.createServer(app);

      const server = new ApolloServer({
        typeDefs,
        resolvers: {
          Query: {
            movies: async (_, __, { dataSources }) => {
              return dataSources.movieAPI.getMovies();
            },
            movie: async (_, { id }, { dataSources }) => {
              return dataSources.movieAPI.getMovie(id);
            },
            smartphones: async (_, __, { dataSources }) => {
              return dataSources.smartphoneAPI.getSmartphones();
            },
            smartphone: async (_, { id }, { dataSources }) => {
              return dataSources.smartphoneAPI.getSmartphone(id);
            },
            combinedData2: async (_, { movieId, smartphoneId }, { dataSources }) => {
              const [movie, smartphone] = await Promise.all([
                dataSources.movieAPI.getMovie(movieId),
                dataSources.smartphoneAPI.getSmartphone(smartphoneId)
              ]);
              return { movie, smartphone };
            }
          }
        },
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        introspection: true,
      });

      console.log('Starting Apollo Server...');
      await server.start();
      console.log('Apollo Server started successfully');

      app.use(
        '/graphql',
        cors(),
        json(),
        expressMiddleware(server, {
          context: async () => ({
            dataSources: {
              movieAPI: new MovieAPI(),
              smartphoneAPI: new SmartphoneAPI()
            }
          })
        })
      );

      app.get('/', (req, res) => {
        res.redirect('/graphql');
      });

      await new Promise((resolve) => httpServer.listen({ port: 5000, host: '0.0.0.0' }, resolve));
      console.log(`🚀 Server ready at http://localhost:5000/graphql`);
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  startApolloServer().catch(error => {
    console.error('Unhandled server error:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('Error reading schema file:', error);
  process.exit(1);
}