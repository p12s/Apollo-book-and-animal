const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { json } = require('body-parser');
const { readFileSync } = require('fs');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { parse } = require('graphql');

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
        schema: buildSubgraphSchema([{
          typeDefs: parse(typeDefs),
          resolvers: {
            Query: {
              combinedData2: async (_, { movieId, smartphoneId }, context) => {
                try {
                  const [movieResponse, smartphoneResponse] = await Promise.all([
                    context.movie(movieId),
                    context.smartphone(smartphoneId)
                  ]);

                  return {
                    movie: movieResponse,
                    smartphone: smartphoneResponse
                  };
                } catch (error) {
                  console.error('Error in combinedData2:', error);
                  throw error;
                }
              }
            }
          }
        }]),
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
        expressMiddleware(server)
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