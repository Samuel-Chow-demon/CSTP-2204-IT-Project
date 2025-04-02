import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase only once
if not firebase_admin._apps:
    cred = credentials.Certificate("../res/privatekey/cstp2204itproj-propertymgt-firebase-key.json")
    firebase_admin.initialize_app(cred)

# Firestore database instance
db = firestore.client()