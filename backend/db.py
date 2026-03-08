"""
MongoDB connection and database access.
"""
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

MONGODB_URI = "mongodb+srv://nysajoy05_db_user:IoSlorHPExPNLsu8@cluster0.m5r2nr4.mongodb.net/?retryWrites=true&w=majority"

_client = None


def get_db():
    """Get the SkillMatch database. Creates connection on first call."""
    global _client
    if _client is None:
        _client = MongoClient(MONGODB_URI)
        try:
            _client.admin.command("ping")
        except ConnectionFailure:
            raise ConnectionError(
                "Could not connect to MongoDB. Check MONGODB_URI."
            )
    # access database
    db = _client["login&signup"]
    return db


def get_users_collection():
    """Get the Skillmatch collection."""
    db = get_db()
    # access collection
    collection = db["Skillmatch"]
    return collection


def get_job_descriptions_collection():
    """Get the JobDescription collection."""
    db = get_db()
    collection = db["JobDescription"]
    return collection


def get_uploaded_resumes_collection():
    """Get the UploadedResume collection."""
    db = get_db()
    collection = db["UploadedResume"]
    return collection
