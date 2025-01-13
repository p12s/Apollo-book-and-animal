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

// Define resolvers with proper error handling
const resolvers = {
  Query: {
    movie: async (_, { id }, { dataSources }) => {
      try {
        return await dataSources.movieAPI.getMovie(id);
      } catch (error) {
        console.error(`Resolver error fetching movie ${id}:`, error);
        throw error;
      }
    },
    smartphone: async (_, { id }, { dataSources }) => {
      try {
        return await dataSources.smartphoneAPI.getSmartphone(id);
      } catch (error) {
        console.error(`Resolver error fetching smartphone ${id}:`, error);
        throw error;
      }
    },
    combinedData2: async (_, { movieId, smartphoneId }, { dataSources }) => {
      try {
        const [movie, smartphone] = await Promise.all([
          dataSources.movieAPI.getMovie(movieId),
          dataSources.smartphoneAPI.getSmartphone(smartphoneId)
        ]);
        return { movie, smartphone };
      } catch (error) {
        console.error(`Resolver error fetching combined data:`, error);
        throw error;
      }
    }
  }
};

async function startApolloServer() {
  try {
    console.log('Initializing Apollo Server...');
    const app = express();
    const httpServer = http.createServer(app);

    // Initialize Apollo Server with enhanced configuration
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
      introspection: true,
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
          message: error.message,
          path: error.path,
          extensions: error.extensions
        };
      }
    });

    console.log('Starting Apollo Server...');
    await server.start();
    console.log('Apollo Server started successfully');

    // Configure middleware with proper context
    app.use(
      '/graphql',
      cors(),
      json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({
          dataSources: {
            movieAPI: new MovieAPI(),
            smartphoneAPI: new SmartphoneAPI()
          },
          token: req.headers.authorization
        })
      })
    );

    // Redirect root to GraphQL playground
    app.get('/', (req, res) => {
      res.redirect('/graphql');
    });

    // Start the server
    await new Promise((resolve) => httpServer.listen({ port: 5000, host: '0.0.0.0' }, resolve));
    console.log(`🚀 Server ready at http://localhost:5000/graphql`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server with proper error handling
startApolloServer().catch(error => {
  console.error('Unhandled server error:', error);
  process.exit(1);
});