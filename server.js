const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { json } = require('body-parser');
const { readFileSync } = require('fs');
const MovieAPI = require('./src/datasources/MovieAPI');
const SmartphoneAPI = require('./src/datasources/SmartphoneAPI');

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

      const resolvers = {
        Query: {
          movies: async (_, __, { dataSources }) => {
            try {
              const response = await dataSources.movieAPI.get('/', {
                headers: { 'Accept': 'application/json' }
              });
              return response.map(movie => ({
                id: movie.id,
                name: movie.title,
                brand: movie.director,
                year: movie.year,
                description: movie.genre,
                imageUrl: movie.posterUrl
              }));
            } catch (error) {
              console.error('Error fetching movies:', error);
              throw error;
            }
          },
          movie: async (_, { id }, { dataSources }) => {
            return dataSources.movieAPI.getMovie(id);
          },
          smartphones: async (_, __, { dataSources }) => {
            try {
              const response = await dataSources.smartphoneAPI.get('', {
                headers: { 'Accept': 'application/json' }
              });
              return response;
            } catch (error) {
              console.error('Error fetching smartphones:', error);
              throw error;
            }
          },
          smartphone: async (_, { id }, { dataSources }) => {
            return dataSources.smartphoneAPI.getSmartphone(id);
          },
          combinedData2: async (_, { movieId, smartphoneId }, { dataSources }) => {
            try {
              const [movie, smartphone] = await Promise.all([
                dataSources.movieAPI.getMovie(movieId),
                dataSources.smartphoneAPI.getSmartphone(smartphoneId)
              ]);
              return { movie, smartphone };
            } catch (error) {
              console.error('Error in combinedData2:', error);
              throw error;
            }
          }
        }
      };

      const server = new ApolloServer({
        typeDefs,
        resolvers,
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