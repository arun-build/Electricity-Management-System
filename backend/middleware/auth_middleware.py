from functools import wraps
from flask import request, jsonify, g
import jwt
from bson import ObjectId
from config import Config
from database import get_users_collection, serialize_doc

def token_required(f):
    """
    Decorator that validates Bearer JWT token in Authorization header.
    Loads user and stores in flask.g.current_user.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Authorization token is missing."}), 401
            
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid token header format. Use 'Bearer <token>'."}), 401
            
        token = parts[1]
        try:
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("sub")
            if not user_id:
                return jsonify({"error": "Invalid token payload."}), 401
                
            users_coll = get_users_collection()
            user = users_coll.find_one({"_id": ObjectId(user_id)})
            if not user:
                return jsonify({"error": "User account no longer exists."}), 401
                
            if user.get("status") == "inactive":
                return jsonify({"error": "Account is deactivated. Contact utility administrator."}), 403
                
            g.current_user = serialize_doc(user)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session token has expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid authentication token."}), 401
        except Exception as e:
            return jsonify({"error": f"Authentication failed: {str(e)}"}), 401
            
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    """
    Decorator that requires the authenticated user to hold the 'admin' role.
    """
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user.get("role") != "admin":
            return jsonify({"error": "Access denied. Administrator privileges required."}), 403
        return f(*args, **kwargs)
    return decorated

def consumer_required(f):
    """
    Decorator that requires the authenticated user to hold the 'consumer' role.
    """
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if g.current_user.get("role") != "consumer":
            return jsonify({"error": "Access denied. Consumer account required."}), 403
        return f(*args, **kwargs)
    return decorated
