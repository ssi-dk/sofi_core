"""Initialize Flask app."""
from __future__ import absolute_import, print_function
import os
from flask import Flask
from flask_assets import Environment
from flask_login import LoginManager
from .models.users_management import db, User, Role
from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin
from apispec_webframeworks.flask import FlaskPlugin
from .routes import myblueprint


spec = APISpec(
    title="Test",
    version="1.0.0",
    openapi_version="3.0.2",
    plugins=[FlaskPlugin(), MarshmallowPlugin()],
)


def script_runs_within_container():
    with open("/proc/1/cgroup", "r") as cgroup_file:
        return "docker" in cgroup_file.read()

def create_app():
    """Construct core Flask application with embedded Dash app."""
    server = Flask(__name__, instance_relative_config=False)
    server.config.from_object("config.Config")
    assets = Environment()
    assets.init_app(server)

    with server.app_context():
        # Import parts of our core Flask app
        from .assets import compile_static_assets

        server.config.update(
            SECRET_KEY=os.urandom(12),
        )

        host = "mongo" if script_runs_within_container() else "localhost"

        server.config["MONGODB_SETTINGS"] = {"db": "dev", "host": host, "port": 27017}

        db.init_app(server)

        # Setup login mangement
        login_manager = LoginManager()
        login_manager.init_app(server)
        login_manager.login_view = "/login"

        # callback to reload the user object
        @login_manager.user_loader
        def load_user(user_id):
            return User.objects(pk=user_id).first()

        # Compile static assets
        # compile_static_assets(assets)

        server.register_blueprint(myblueprint)

        @server.route("/a")
        def swagger2():
            return "as"

        with server.test_request_context():
            for rule in server.url_map.iter_rules():
                spec.path(view=server.view_functions[rule.endpoint])

        @server.route("/swagger.json")
        def swagger():
            return json.dumps(spec.to_dict(), indent=2)

        return server
