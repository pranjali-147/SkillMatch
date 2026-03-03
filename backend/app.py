from flask import Flask
from flask_cors import CORS
from routes.jd_routes import jd_bp
from routes.analyze_routes import analyze_routes
from routes.auth_routes import auth_bp

app = Flask(__name__)
app.secret_key = "supersecretkey"

app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False

CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000"]
)

app.register_blueprint(jd_bp)
app.register_blueprint(analyze_routes)
app.register_blueprint(auth_bp)

if __name__ == "__main__":
    app.run(debug=True)
