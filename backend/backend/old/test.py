import firebase_admin
from firebase_admin import credentials, db
from flask import Flask, request, jsonify

app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://chat-gpt-4c586-default-rtdb.firebaseio.com/'
})


# Define the root URL route
@app.route('/')
def index():
    return 'Welcome to the Flask App! I am Rahul.'


@app.route('/data', methods=['GET'])
def get_data():
    ref = db.reference('testing')
    data = ref.get()
    return jsonify(data)


@app.route('/data', methods=['POST'])
def add_data():
    data = request.get_json()
    ref = db.reference('testing')
    new_ref = ref.push(data)
    return jsonify({"message": "Data added successfully", "id": new_ref.key})


@app.route('/data/<id>', methods=['PUT'])
def update_data(id):
    data = request.get_json()
    ref = db.reference(f'testing/{id}')
    ref.update(data)
    return jsonify({"message": "Data updated successfully"})


@app.route('/data/<id>', methods=['DELETE'])
def delete_data(id):
    ref = db.reference(f'testing/{id}')
    ref.delete()
    return jsonify({"message": "Data deleted successfully"})


if __name__ == '__main__':
    app.run(debug=True)
