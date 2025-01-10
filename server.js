const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { json } = require('body-parser');
const { readFileSync } = require('fs');
const BookAPI = require('./src/datasources/BookAPI');
const AnimalAPI = require('./src/datasources/AnimalAPI');

const typeDefs = readFileSync('./supergraph.graphql', 'utf8');

const resolvers = {
    Query: {
        books: async (_, __, { dataSources }) => {
            return dataSources.bookAPI.getBooks();
        },
        book: async (_, { id }, { dataSources }) => {
            return dataSources.bookAPI.getBook(id);
        },
        animals: async (_, __, { dataSources }) => {
            return dataSources.animalAPI.getAnimals();
        },
        animal: async (_, { id }, { dataSources }) => {
            return dataSources.animalAPI.getAnimal(id);
        },
        combinedData: async (_, { bookId, animalId }, { dataSources }) => {
            const [book, animal] = await Promise.all([
                dataSources.bookAPI.getBook(bookId),
                dataSources.animalAPI.getAnimal(animalId)
            ]);

            return {
                book,
                animal
            };
        },
    },
};

async function startApolloServer() {
    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();

    app.use(
        '/graphql',
        cors(),
        json(),
        expressMiddleware(server, {
            context: async ({ req }) => {
                const bookAuth = req.headers['x-book-auth']?.replace('Bearer ', '') || '';
                const animalAuth = req.headers['x-animal-auth']?.replace('Bearer ', '') || '';

                const dataSources = {
                    bookAPI: new BookAPI(),
                    animalAPI: new AnimalAPI(),
                };

                // Set the context for each data source
                dataSources.bookAPI.context = { bookAuth };
                dataSources.animalAPI.context = { animalAuth };

                return {
                    dataSources,
                };
            },
        }),
    );

    app.get('/', (req, res) => {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>GraphQL Playground</title>
                <meta charset=utf-8 />
                <meta name="viewport" content="user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, minimal-ui">
                <link rel="shortcut icon" href="https://cdn.jsdelivr.net/npm/graphql-playground-react/build/favicon.png" />
                <script src="https://cdn.jsdelivr.net/npm/graphql-playground-react/build/static/js/middleware.js"></script>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/graphql-playground-react/build/static/css/index.css" />
            </head>
            <body>
                <div id="root">
                    <style>
                        body {
                            background-color: rgb(23, 42, 58);
                            font-family: Open Sans, sans-serif;
                            height: 90vh;
                        }
                    </style>
                    <div id="root" style="height: 100%; width: 100%;"></div>
                    <script>window.addEventListener('load', function (event) {
                        const root = document.getElementById('root');
                        root.classList.add('playgroundIn');
                        GraphQLPlayground.init(root, {
                            endpoint: '/graphql',
                            settings: {
                                'request.credentials': 'same-origin',
                            },
                            headers: {
                                'X-Book-Auth': 'Bearer 12345-this-is-secret-token',
                                'X-Animal-Auth': 'Bearer 54321-this-is-secret-token'
                            },
                            tabs: [
                                {
                                    name: 'Combined Query',
                                    query: \`query GetCombinedData {
                                        combinedData(bookId: "1", animalId: 3) {
                                            book {
                                                id
                                                title
                                                author
                                                year
                                            }
                                            animal {
                                                id
                                                name
                                                species
                                                age
                                                diet
                                                habitat
                                                health_status
                                            }
                                        }
                                    }\`
                                }
                            ]
                        })
                    })</script>
                </div>
            </body>
            </html>
        `);
    });

    await new Promise((resolve) => httpServer.listen({ port: 5000, host: '0.0.0.0' }, resolve));
    console.log(`🚀 Server ready at http://localhost:5000`);
}

startApolloServer();