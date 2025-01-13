const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway');
const { readFileSync } = require('fs');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { json } = require('body-parser');

const supergraphSdl = readFileSync('./supergraph.graphql', 'utf8');

async function startApolloServer() {
    const app = express();
    const httpServer = http.createServer(app);

    const gateway = new ApolloGateway({
        supergraphSdl,
        experimental_enableConnectSupport: true,
        buildService: ({ name }) => {
            return new RemoteGraphQLDataSource({
                willSendRequest({ request, context }) {
                    if (name === 'bookService' && context.bookAuth) {
                        request.http.headers.set('Authorization', `Bearer ${context.bookAuth}`);
                    }
                    if (name === 'animalService' && context.animalAuth) {
                        request.http.headers.set('Authorization', `Bearer ${context.animalAuth}`);
                    }
                    if (name === 'movieService') {
                        request.http.headers.set('Authorization', 'Bearer 12345-this-is-secret-token');
                    }
                    if (name === 'smartphoneService') {
                        request.http.headers.set('Authorization', 'Bearer 54321-this-is-secret-token');
                    }
                }
            });
        }
    });

    const server = new ApolloServer({
        gateway,
        introspection: true,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();

    app.use(
        '/graphql',
        cors(),
        json(),
        expressMiddleware(server, {
            context: async ({ req }) => ({
                bookAuth: req.headers['x-book-auth']?.replace('Bearer ', '') || '',
                animalAuth: req.headers['x-animal-auth']?.replace('Bearer ', '') || '',
            }),
        }),
    );

    app.get('/', (req, res) => {
        res.redirect('/graphql');
    });

    await new Promise((resolve) => httpServer.listen({ port: 5000, host: '0.0.0.0' }, resolve));
    console.log(`🚀 Server ready at http://localhost:5000/graphql`);
}

startApolloServer().catch(console.error);