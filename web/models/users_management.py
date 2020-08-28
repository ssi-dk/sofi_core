from werkzeug.security import generate_password_hash, check_password_hash
from flask_mongoengine import MongoEngine
from flask_login import UserMixin
from enum import Enum

db = MongoEngine()

class User(UserMixin, db.Document):
    meta = {'allow_inheritance': True}

    username = db.StringField(required=True, max_length=15)
    email = db.StringField(required=True, max_length=50)
    password = db.StringField(required=True, max_length=512)
    role = db.StringField(required=True)

    @staticmethod
    def check_user_password(password, hashed):
        return check_password_hash(hashed, password)

    @staticmethod
    def add_user(username, password, email, role):
        hashed_password = generate_password_hash(password, method='pbkdf2:sha512')
        User.objects.insert(User(username=username, password=hashed_password, email=email, role=role))

    @staticmethod
    def show_users():
        users = []
        for x in User.objects():
            users.append({
                'username' : x["username"],
                'email' : x["email"],
                'role' : str(x["role"])
            })

        print(users)
        return users

    @staticmethod
    def update_password():
        pass

    def is_role(self, role):
        return Role(self.role) == role 


class Role(Enum):
    Administrator = 'Administrator'
    ITSupporter = 'ITSupporter'
    SuperUser = 'SuperUser'
    Analyst = 'Analyst'
    FVSTLAB = 'FVSTLAB'
    SSILAB = 'SSILAB'