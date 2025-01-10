const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { json } = require('body-parser');

const typeDefs = `#graphql
    type Book {
        id: ID!
        title: String!
        author: String!
        year: Int
    }

    type Animal {
        id: ID!
        name: String!
        species: String!
        age: Int
        diet: String
        habitat: String
        health_status: String
    }

    type Query {
        books: [Book]
        book(id: ID!): Book
        animals: [Animal]
        animal(id: ID!): Animal
        combinedData(bookId: ID!, animalId: ID!): CombinedResponse
    }

    type CombinedResponse {
        book: Book
        animal: Animal
    }
`;

const resolvers = {
    Query: {
        books: async (_, __, context) => {
            const { bookAuth } = context;
            if (!bookAuth) throw new Error("Book service authentication required");

            try {
                const response = await fetch('https://apollo-tracker-socrations.replit.app/api/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${bookAuth}`,
                    },
                    body: JSON.stringify({
                        query: `
                            query {
                                books {
                                    id
                                    title
                                    author
                                    year
                                }
                            }
                        `
                    }),
                });

                const data = await response.json();
                if (data.errors) throw new Error(data.errors[0].message);
                return data.data.books;
            } catch (error) {
                throw new Error(`Book service error: ${error.message}`);
            }
        },
        book: async (_, { id }, context) => {
            const { bookAuth } = context;
            if (!bookAuth) throw new Error("Book service authentication required");

            try {
                const response = await fetch('https://apollo-tracker-socrations.replit.app/api/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${bookAuth}`,
                    },
                    body: JSON.stringify({
                        query: `
                            query GetBook($id: ID!) {
                                book(id: $id) {
                                    id
                                    title
                                    author
                                    year
                                }
                            }
                        `,
                        variables: { id }
                    }),
                });

                const data = await response.json();
                if (data.errors) throw new Error(data.errors[0].message);
                return data.data.book;
            } catch (error) {
                throw new Error(`Book service error: ${error.message}`);
            }
        },
        animals: async (_, __, context) => {
            const { animalAuth } = context;
            if (!animalAuth) throw new Error("Animal service authentication required");

            try {
                const response = await fetch('https://apollo-animal-socrations.replit.app/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${animalAuth}`,
                    },
                    body: JSON.stringify({
                        query: `
                            query {
                                animals {
                                    id
                                    name
                                    species
                                    age
                                    diet
                                    habitat
                                    health_status
                                }
                            }
                        `
                    }),
                });

                const data = await response.json();
                if (data.errors) throw new Error(data.errors[0].message);
                return data.data.animals;
            } catch (error) {
                throw new Error(`Animal service error: ${error.message}`);
            }
        },
        animal: async (_, { id }, context) => {
            const { animalAuth } = context;
            if (!animalAuth) throw new Error("Animal service authentication required");

            try {
                const response = await fetch('https://apollo-animal-socrations.replit.app/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${animalAuth}`,
                    },
                    body: JSON.stringify({
                        query: `
                            query GetAnimal($id: Int!) {
                                animal(id: $id) {
                                    id
                                    name
                                    species
                                    age
                                    diet
                                    habitat
                                    health_status
                                }
                            }
                        `,
                        variables: { id: parseInt(id) }
                    }),
                });

                const data = await response.json();
                if (data.errors) throw new Error(data.errors[0].message);
                return data.data.animal;
            } catch (error) {
                throw new Error(`Animal service error: ${error.message}`);
            }
        },
        combinedData: async (_, { bookId, animalId }, context) => {
            const { bookAuth, animalAuth } = context;
            if (!bookAuth || !animalAuth) {
                throw new Error("Both book and animal service authentication required");
            }

            try {
                const [bookResponse, animalResponse] = await Promise.all([
                    context.dataSources.bookAPI.getBook(bookId),
                    context.dataSources.animalAPI.getAnimal(animalId)
                ]);

                return {
                    book: bookResponse,
                    animal: animalResponse
                };
            } catch (error) {
                throw new Error(`Error fetching combined data: ${error.message}`);
            }
        },
    },
};

async function startApolloServer() {
    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
        typeDefs,
        resolvers,
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

                return {
                    bookAuth,
                    animalAuth,
                    dataSources: {
                        bookAPI: {
                            getBook: (id) => resolvers.Query.book(null, { id }, { bookAuth }),
                        },
                        animalAPI: {
                            getAnimal: (id) => resolvers.Query.animal(null, { id }, { animalAuth }),
                        },
                    },
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

    await new Promise((resolve) => httpServer.listen({ port: 5000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:5000/graphql`);
}

startApolloServer();