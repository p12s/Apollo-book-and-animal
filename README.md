# GraphQL Aggregation Service

A sophisticated GraphQL aggregation service that combines book and animal data from authenticated third-party GraphQL services.

## Features

- Unified GraphQL endpoint for querying both books and animals
- Bearer token authentication for both services
- Combined data queries
- Interactive GraphQL Playground interface

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

## Setup

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

## Environment Variables

The service requires authentication tokens for the external services:

- Book Service: `Bearer 12345-this-is-secret-token`
- Animal Service: `Bearer 54321-this-is-secret-token`

These are already configured in the GraphQL Playground interface.

## Running the Service

Start the server:
```bash
node server.js
```

The service will be available at:
- GraphQL Playground: `http://localhost:5000`
- GraphQL Endpoint: `http://localhost:5000/graphql`

## Example Queries

### Combined Query
```graphql
query GetCombinedData {
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
}
```

### Required Headers
```json
{
  "X-Book-Auth": "Bearer 12345-this-is-secret-token",
  "X-Animal-Auth": "Bearer 54321-this-is-secret-token"
}
```

## External Services

### Book Service
- Endpoint: `https://apollo-tracker-socrations.replit.app/api/graphql`
- Authentication: Bearer token required
- Available queries: books, book(id)

### Animal Service
- Endpoint: `https://apollo-animal-socrations.replit.app/graphql`
- Authentication: Bearer token required
- Available queries: animals, animal(id)