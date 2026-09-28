from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient
from config import Config

_client = None
_db = None

def get_client():
    """Returns singleton MongoDB client instance."""
    global _client
    if _client is None:
        _client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
    return _client

def get_db():
    """Returns the application MongoDB database instance."""
    global _db
    if _db is None:
        client = get_client()
        _db = client[Config.DB_NAME]
    return _db

def get_users_collection():
    """Get the users collection."""
    return get_db()["users"]

def get_bills_collection():
    """Get the bills collection."""
    return get_db()["bills"]

def get_tariffs_collection():
    """Get the tariffs collection."""
    return get_db()["tariffs"]

def serialize_doc(doc):
    """
    Recursively converts MongoDB BSON documents into JSON-serializable dictionaries.
    Converts ObjectId to string, datetime to ISO format string.
    """
    if doc is None:
        return None
    
    serialized = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            serialized[key] = str(value)
            if key == "_id":
                serialized["id"] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        elif isinstance(value, dict):
            serialized[key] = serialize_doc(value)
        elif isinstance(value, list):
            serialized[key] = [
                serialize_doc(item) if isinstance(item, dict)
                else str(item) if isinstance(item, ObjectId)
                else item.isoformat() if isinstance(item, datetime)
                else item
                for item in value
            ]
        else:
            serialized[key] = value
            
    # Ensure id field is always present
    if "_id" in serialized and "id" not in serialized:
        serialized["id"] = serialized["_id"]
        
    return serialized

def serialize_docs(docs):
    """Converts a cursor or list of MongoDB documents into JSON-serializable list."""
    return [serialize_doc(doc) for doc in docs]
