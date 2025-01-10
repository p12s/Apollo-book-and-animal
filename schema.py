type_defs = """
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
"""