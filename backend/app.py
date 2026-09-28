import sys
import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import get_db, get_users_collection

from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.consumer_routes import consumer_bp
from routes.bill_routes import bill_bp

# Configure Windows console encoding safely
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def auto_seed_if_empty():
    """Checks if the MongoDB database is empty and automatically preloads demo data."""
    try:
        users_coll = get_users_collection()
        if users_coll.count_documents({}) == 0:
            print("[INFO] Empty database detected. Auto-preloading demo data for instant demo...")
            from seed_data import seed_database
            seed_database()
            print("[SUCCESS] Preloaded demo data is ready!")
    except Exception as e:
        print(f"[WARNING] Could not check or auto-seed database: {str(e)}")

def create_app():
    """Application factory for the Electricity Bill Management System backend."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend client
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    )

    # Register API blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(consumer_bp)
    app.register_blueprint(bill_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Health check endpoint confirming API and DB connectivity."""
        try:
            db = get_db()
            db.command("ping")
            db_status = "connected"
        except Exception as e:
            db_status = f"disconnected ({str(e)})"

        return jsonify({
            "status": "healthy",
            "service": "Electricity Bill Management System API",
            "version": "1.0.0",
            "database": db_status
        }), 200

    @app.errorhandler(404)
    def handle_not_found(e):
        return jsonify({"error": "The requested API resource was not found."}), 404

    @app.errorhandler(500)
    def handle_server_error(e):
        return jsonify({"error": "An internal server error occurred."}), 500

    return app

app = create_app()

if __name__ == "__main__":
    # Ensure database is preloaded with demo data on first launch
    auto_seed_if_empty()
    print(f"[SERVER] Electricity Bill Management System API starting on http://localhost:{Config.PORT}")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
