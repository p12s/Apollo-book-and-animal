const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloGateway } = require('@apollo/gateway');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { json } = require('body-parser');
const { readFileSync } = require('fs');

const typeDefs = readFileSync('./supergraph.graphql', 'utf8');

async function startApolloServer() {
    const app = express();
    const httpServer = http.createServer(app);

    const gateway = new ApolloGateway({
        supergraphSdl: typeDefs,
    });

    const server = new ApolloServer({
        gateway,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        introspection: true
    });

    await server.start();

    app.use(
        '/graphql',
        cors(),
        json(),
        expressMiddleware(server, {
            context: async ({ req }) => ({
                bookAuth: req.headers['x-book-auth']?.replace('Bearer ', '') || '',
                animalAuth: req.headers['x-animal-auth']?.replace('Bearer ', '') || ''
            })
        })
    );

    app.get('/', (req, res) => {
        res.redirect('/graphql');
    });

    await new Promise((resolve) => httpServer.listen({ port: 5000, host: '0.0.0.0' }, resolve));
    console.log(`🚀 Server ready at http://localhost:5000/graphql`);
}

startApolloServer().catch(console.error);