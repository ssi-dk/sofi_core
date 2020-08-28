from werkzeug.security import generate_password_hash, check_password_hash
from flask_mongoengine import MongoEngine
from flask_login import UserMixin


db = MongoEngine()

class User(UserMixin, db.Document):
    meta = {'allow_inheritance': True}

    username = db.StringField(required=True, max_length=15)
    email = db.StringField(required=True, max_length=50)
    password = db.StringField(required=True, max_length=512)
    admin = db.BooleanField(required=True)

    @staticmethod
    def check_user_password(password, hashed):
        return check_password_hash(hashed, password)

    @staticmethod
    def add_user(username, password, email, admin):
        hashed_password = generate_password_hash(password, method='pbkdf2:sha512')
        User.objects.insert(User(username=username, password=hashed_password, email=email, admin=admin))

    @staticmethod
    def show_users():
        users = []
        for x in User.objects():
            users.append({
                'username' : x["username"],
                'email' : x["email"],
                'admin' : str(x["admin"])
            })

        print(users)
        return users




def update_password():
    pass

