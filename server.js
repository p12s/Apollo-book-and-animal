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
const MovieAPI = require('./src/datasources/MovieAPI');
const SmartphoneAPI = require('./src/datasources/SmartphoneAPI');

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
        combinedData2: async (_, { movieId, smartphoneId }, { dataSources }) => {
            const [movie, smartphone] = await Promise.all([
                dataSources.movieAPI.getMovie(movieId),
                dataSources.smartphoneAPI.getSmartphone(smartphoneId)
            ]);

            return {
                movie,
                smartphone
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
                const dataSources = {
                    bookAPI: new BookAPI(),
                    animalAPI: new AnimalAPI(),
                    movieAPI: new MovieAPI(),
                    smartphoneAPI: new SmartphoneAPI(),
                };

                // Set authentication tokens for each service
                dataSources.bookAPI.context = { 
                    bookAuth: req.headers['x-book-auth']?.replace('Bearer ', '') || ''
                };
                dataSources.animalAPI.context = { 
                    animalAuth: req.headers['x-animal-auth']?.replace('Bearer ', '') || ''
                };

                return {
                    dataSources,
                };
            },
        }),
    );

    app.get('/', (req, res) => {
        res.redirect('/graphql');
    });

    await new Promise((resolve) => httpServer.listen({ port: 5000, host: '0.0.0.0' }, resolve));
    console.log(`🚀 Server ready at http://localhost:5000/graphql`);
}

startApolloServer();