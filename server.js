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

// Read schema files
try {
  console.log('Reading schema files...');
  const movieSchema = readFileSync('./src/models/movie.graphql', 'utf8');
  const smartphoneSchema = readFileSync('./src/models/smartphone.graphql', 'utf8');

  // Combine schemas
  const combinedSchema = `${movieSchema}\n${smartphoneSchema}`;

  console.log('Schema files loaded successfully');

  async function startApolloServer() {
    try {
      console.log('Initializing Apollo Server...');
      const app = express();
      const httpServer = http.createServer(app);

      const server = new ApolloServer({
        schema: buildSubgraphSchema([{ 
          typeDefs: parse(combinedSchema),
          resolvers: {
            Query: {
              combinedData2: async (_, { movieId, smartphoneId }, { dataSources }) => {
                const movie = await dataSources.movieService.movie(movieId);
                const smartphone = await dataSources.smartphoneService.smartphone(smartphoneId);
                return { movie, smartphone };
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
  console.error('Error reading schema files:', error);
  process.exit(1);
}