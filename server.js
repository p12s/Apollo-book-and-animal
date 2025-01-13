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

// Enhanced error handling for schema reading
let typeDefs;
try {
  console.log('Reading schema file...');
  typeDefs = readFileSync('./schema.graphql', 'utf8');
  console.log('Schema file loaded successfully');
} catch (error) {
  console.error('Error reading schema file:', error);
  process.exit(1);
}

const resolvers = {
  Query: {
    movie: async (_, { id }, { dataSources }) => {
      return dataSources.movieAPI.getMovie(id);
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
};

async function startApolloServer() {
  try {
    console.log('Initializing Apollo Server...');
    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
      introspection: true,
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return error;
      }
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