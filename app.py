import os
from flask import Flask, request, jsonify
from ariadne import make_executable_schema, graphql_sync
from schema import type_defs
from resolvers import query

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "default_secret_key")

# Create executable schema
schema = make_executable_schema(type_defs, [query])

@app.route("/graphql", methods=["GET"])
def graphql_playground():
    """Serve GraphQL Playground HTML"""
    html_content = '''
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
                const wsProto = location.protocol == 'https:' ? 'wss:' : 'ws:'
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
                            query: `query GetCombinedData {
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
}`
                        }
                    ]
                })
            })</script>
        </div>
    </body>
    </html>
    '''
    return html_content, 200, {'Content-Type': 'text/html'}

@app.route("/graphql", methods=["POST"])
def graphql_server():
    """Handle GraphQL queries"""
    data = request.get_json()

    # Get authentication headers
    book_auth = request.headers.get('X-Book-Auth', '').replace('Bearer ', '')
    animal_auth = request.headers.get('X-Animal-Auth', '').replace('Bearer ', '')

    # Add auth tokens to context
    context = {
        "book_auth": book_auth,
        "animal_auth": animal_auth
    }

    success, result = graphql_sync(
        schema,
        data,
        context_value=context,
        debug=app.debug
    )

    status_code = 200 if success else 400
    return jsonify(result), status_code

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)