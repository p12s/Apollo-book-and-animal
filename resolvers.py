from ariadne import QueryType
from services import get_books, get_book, get_animals, get_animal

query = QueryType()

@query.field("books")
def resolve_books(_, info):
    """Resolver for books query"""
    auth_token = info.context.get('book_auth')
    if not auth_token:
        raise Exception("Book service authentication required")

    try:
        return get_books(auth_token)
    except Exception as e:
        raise Exception(f"Error fetching books: {str(e)}")

@query.field("book")
def resolve_book(_, info, id):
    """Resolver for single book query"""
    auth_token = info.context.get('book_auth')
    if not auth_token:
        raise Exception("Book service authentication required")

    try:
        return get_book(id, auth_token)
    except Exception as e:
        raise Exception(f"Error fetching book: {str(e)}")

@query.field("animals")
def resolve_animals(_, info):
    """Resolver for animals query"""
    auth_token = info.context.get('animal_auth')
    if not auth_token:
        raise Exception("Animal service authentication required")

    try:
        return get_animals(auth_token)
    except Exception as e:
        raise Exception(f"Error fetching animals: {str(e)}")

@query.field("animal")
def resolve_animal(_, info, id):
    """Resolver for single animal query"""
    auth_token = info.context.get('animal_auth')
    if not auth_token:
        raise Exception("Animal service authentication required")

    try:
        return get_animal(id, auth_token)
    except Exception as e:
        raise Exception(f"Error fetching animal: {str(e)}")

@query.field("combinedData")
def resolve_combined_data(_, info, bookId, animalId):
    """Resolver for combined book and animal data query"""
    book_auth = info.context.get('book_auth')
    animal_auth = info.context.get('animal_auth')

    if not book_auth or not animal_auth:
        raise Exception("Both book and animal service authentication required")

    try:
        book = get_book(bookId, book_auth)
        animal = get_animal(animalId, animal_auth)
        return {
            "book": book,
            "animal": animal
        }
    except Exception as e:
        raise Exception(f"Error fetching combined data: {str(e)}")