const { ApolloRouter } = require('@apollo/router');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { readFileSync } = require('fs');

const typeDefs = readFileSync('./supergraph.graphql', 'utf8');

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
                const bookPromise = context.dataSources.bookAPI.getBook(bookId);
                const animalPromise = context.dataSources.animalAPI.getAnimal(animalId);

                const [book, animal] = await Promise.all([bookPromise, animalPromise]);

                return {
                    book,
                    animal
                };
            } catch (error) {
                throw new Error(`Error fetching combined data: ${error.message}`);
            }
        },
    },
};

async function startApolloRouter() {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    const { url } = await startStandaloneServer(server, {
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
        listen: { port: 5000, host: '0.0.0.0' }
    });

    console.log(`🚀 Server ready at ${url}`);
}

startApolloRouter();