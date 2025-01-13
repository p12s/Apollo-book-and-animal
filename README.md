# GraphQL Aggregation Service

A sophisticated GraphQL aggregation service that combines movie and smartphone data from authenticated third-party services.

## Features

- Unified GraphQL endpoint for querying both movies and smartphones
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

- Movie Service: `Bearer 12345-this-is-secret-token`
- Smartphone Service: `Bearer 54321-this-is-secret-token`

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
  combinedData2(movieId: "1", smartphoneId: "3") {
    movie {
      id
      name
      brand
      year
      description
      imageUrl
    }
    smartphone {
      id
      name
      brand
      model
      year
      price
      specs
    }
  }
}
```

### Required Headers
```json
{
  "X-Movie-Auth": "Bearer 12345-this-is-secret-token",
  "X-Smartphone-Auth": "Bearer 54321-this-is-secret-token"
}
```

## External Services

### Movie Service
- Endpoint: `https://movie-tracker-socrations.replit.app/api/movies`
- Authentication: Bearer token required
- Available queries: movie(id)

### Smartphone Service
- Endpoint: `https://smartphone-rest-socrations.replit.app/api/smartphones`
- Authentication: Bearer token required
- Available queries: smartphone(id)