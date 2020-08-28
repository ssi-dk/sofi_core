"""Initialize Flask app."""
import os
from flask import Flask
from dash import Dash
from flask_assets import Environment
from flask_login import LoginManager
from .models.users_management import db, User, Role


def script_runs_within_container():
    with open('/proc/1/cgroup', 'r') as cgroup_file:
        return 'docker' in cgroup_file.read()

def create_app():
    """Construct core Flask application with embedded Dash app."""
    server = Flask(__name__, instance_relative_config=False)
    server.config.from_object('config.Config')
    assets = Environment()
    assets.init_app(server)

    with server.app_context():
        # Import parts of our core Flask app
        from . import routes
        from .assets import compile_static_assets

        # Import Dash application
        #from .plotlydash.dashboard import create_dashboard
        #app = create_dashboard(app)

        server.config.update(
            SECRET_KEY=os.urandom(12),
        )

        host = 'mongo' if script_runs_within_container() else 'localhost'
        
        server.config['MONGODB_SETTINGS'] = {
            'db': 'dev',
            'host': 'mongo',
            'port': 27017
        }

        db.init_app(server)

        # Setup login mangement
        login_manager = LoginManager()
        login_manager.init_app(server)
        login_manager.login_view = '/login'

        # callback to reload the user object
        @login_manager.user_loader
        def load_user(user_id):
            return User.objects(pk=user_id).first()

        app = Dash(
            server=server,
            routes_pathname_prefix='/',
            external_stylesheets=['/static/dist/css/flatly-custom.css']
        )

        from web.plotlydash.index import layout, init_callbacks
        app.layout = layout
        init_callbacks(app)


        # Compile static assets
        # compile_static_assets(assets)

        return server
