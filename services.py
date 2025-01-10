import requests
from typing import Dict, List, Optional

# Service URLs
BOOK_SERVICE_URL = "https://apollo-tracker-socrations.replit.app/api/graphql"
ANIMAL_SERVICE_URL = "https://apollo-animal-socrations.replit.app/graphql"

def get_books(auth_token: str) -> List[Dict]:
    """Fetch all books from the book service"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    query = """
    query {
        books {
            id
            title
            author
            year
        }
    }
    """
    try:
        response = requests.post(BOOK_SERVICE_URL, headers=headers, json={"query": query})
        response.raise_for_status()
        data = response.json()
        if "errors" in data:
            raise Exception(str(data["errors"]))
        return data.get("data", {}).get("books", [])
    except requests.exceptions.RequestException as e:
        raise Exception(f"Book service error: {str(e)}")

def get_book(book_id: str, auth_token: str) -> Optional[Dict]:
    """Fetch a single book from the book service"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    query = """
    query GetBook($id: ID!) {
        book(id: $id) {
            id
            title
            author
            year
        }
    }
    """
    variables = {"id": book_id}
    try:
        response = requests.post(BOOK_SERVICE_URL, headers=headers, json={"query": query, "variables": variables})
        response.raise_for_status()
        data = response.json()
        if "errors" in data:
            raise Exception(str(data["errors"]))
        return data.get("data", {}).get("book")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Book service error: {str(e)}")

def get_animals(auth_token: str) -> List[Dict]:
    """Fetch all animals from the animal service"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    query = """
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
    """
    try:
        response = requests.post(ANIMAL_SERVICE_URL, headers=headers, json={"query": query})
        response.raise_for_status()
        data = response.json()
        if "errors" in data:
            raise Exception(str(data["errors"]))
        return data.get("data", {}).get("animals", [])
    except requests.exceptions.RequestException as e:
        raise Exception(f"Animal service error: {str(e)}")

def get_animal(animal_id: str, auth_token: str) -> Optional[Dict]:
    """Fetch a single animal from the animal service"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    query = """
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
    """
    variables = {"id": int(animal_id)}
    try:
        response = requests.post(ANIMAL_SERVICE_URL, headers=headers, json={"query": query, "variables": variables})
        response.raise_for_status()
        data = response.json()
        if "errors" in data:
            raise Exception(str(data["errors"]))
        return data.get("data", {}).get("animal")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Animal service error: {str(e)}")