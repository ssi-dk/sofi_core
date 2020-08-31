import dash_core_components as dcc
import dash_html_components as html
import dash_bootstrap_components as dbc
import dash_table as dt
from dash.dependencies import Input, Output, State

from web import User, Role


def layout():
    return dbc.Container(
        [
            dcc.Store(id="user_store"),
            html.Br(),
            dbc.Container(
                [
                    dcc.Location(id="urlUserAdmin", refresh=True),
                    html.H3("Add New User"),
                    html.Hr(),
                    dbc.Row(
                        [
                            dbc.Col(
                                [
                                    dbc.Label("Username: "),
                                    dcc.Input(
                                        id="newUsername",
                                        className="form-control",
                                        n_submit=0,
                                        style={"width": "90%"},
                                    ),
                                    html.Br(),
                                    dbc.Label("Password: "),
                                    dcc.Input(
                                        id="newPwd1",
                                        type="password",
                                        className="form-control",
                                        n_submit=0,
                                        style={"width": "90%"},
                                    ),
                                    html.Br(),
                                    dbc.Label("Retype New Password: "),
                                    dcc.Input(
                                        id="newPwd2",
                                        type="password",
                                        className="form-control",
                                        n_submit=0,
                                        style={"width": "90%"},
                                    ),
                                    html.Br(),
                                ],
                                md=4,
                            ),
                            dbc.Col(
                                [
                                    dbc.Label("Email: "),
                                    dcc.Input(
                                        id="newEmail",
                                        className="form-control",
                                        n_submit=0,
                                        style={"width": "90%"},
                                    ),
                                    html.Br(),
                                    dbc.Label("Role "),
                                    dcc.Dropdown(
                                        id="role",
                                        style={"width": "90%"},
                                        options=[
                                            {"label": role, "value": role}
                                            for role in Role._member_names_
                                        ],
                                        value=0,
                                        clearable=False,
                                    ),
                                    html.Br(),
                                    html.Br(),
                                    html.Button(
                                        children="Create User",
                                        id="createUserButton",
                                        n_clicks=0,
                                        type="submit",
                                        className="btn btn-primary btn-lg",
                                    ),
                                    html.Br(),
                                    html.Div(id="createUserSuccess"),
                                ],
                                md=4,
                            ),
                            dbc.Col([], md=4),
                        ]
                    ),
                ],
                className="jumbotron",
            ),
            dbc.Container(
                [
                    html.H3("View Users"),
                    html.Hr(),
                    dbc.Row(
                        [
                            dbc.Col(
                                [
                                    dt.DataTable(
                                        id="users",
                                        columns=[
                                            {"name": "Username", "id": "username"},
                                            {"name": "Email", "id": "email"},
                                            {"name": "Role", "id": "role"},
                                        ],
                                        data=User.get_users(),
                                    ),
                                ],
                                md=12,
                            ),
                        ]
                    ),
                ],
                className="jumbotron",
            ),
        ]
    )


def init_callbacks(app):

    # Validate usernames
    @app.callback(
        Output("newUsername", "className"),
        [
            Input("createUserButton", "n_clicks"),
            Input("newUsername", "n_submit"),
            Input("newPwd1", "n_submit"),
            Input("newPwd2", "n_submit"),
            Input("newEmail", "n_submit"),
        ],
        [State("newUsername", "value")],
    )
    def validateUsername(
        n_clicks,
        usernameSubmit,
        newPassword1Submit,
        newPassword2Submit,
        newEmailSubmit,
        newUsername,
    ):

        if (
            (n_clicks > 0)
            or (usernameSubmit > 0)
            or (newPassword1Submit > 0)
            or (newPassword2Submit > 0)
            or (newEmailSubmit > 0)
        ):

            if newUsername == None or newUsername == "":
                return "form-control is-invalid"
            else:
                return "form-control is-valid"
        else:
            return "form-control"

    # Create user button clicked/enter pressed, password validation
    # returns multiple outputs for the classnames of the input
    @app.callback(
        [Output("newPwd1", "className"), Output("newPwd2", "className")],
        [
            Input("createUserButton", "n_clicks"),
            Input("newUsername", "n_submit"),
            Input("newPwd1", "n_submit"),
            Input("newPwd2", "n_submit"),
            Input("newEmail", "n_submit"),
        ],
        [State("newPwd1", "value"), State("newPwd2", "value")],
    )
    def validatePassword1(
        n_clicks,
        usernameSubmit,
        newPassword1Submit,
        newPassword2Submit,
        newEmailSubmit,
        newPassword1,
        newPassword2,
    ):

        if (
            (n_clicks > 0)
            or (usernameSubmit > 0)
            or (newPassword1Submit > 0)
            or (newPassword2Submit > 0)
            or (newEmailSubmit > 0)
        ):

            if newPassword1 == newPassword2 and len(newPassword1) > 7:
                return "form-control is-valid", "form-control is-valid"
            else:
                return "form-control is-invalid", "form-control is-invalid"
        else:
            return "form-control", "form-control"

    # Validate Email
    @app.callback(
        Output("newEmail", "className"),
        [
            Input("createUserButton", "n_clicks"),
            Input("newUsername", "n_submit"),
            Input("newPwd1", "n_submit"),
            Input("newPwd2", "n_submit"),
            Input("newEmail", "n_submit"),
        ],
        [State("newEmail", "value")],
    )
    def validateEmail(
        n_clicks,
        usernameSubmit,
        newPassword1Submit,
        newPassword2Submit,
        newEmailSubmit,
        newEmail,
    ):

        if (
            (n_clicks > 0)
            or (usernameSubmit > 0)
            or (newPassword1Submit > 0)
            or (newPassword2Submit > 0)
            or (newEmailSubmit > 0)
        ):

            if newEmail == None or newEmail == "":
                return "form-control is-invalid"
            else:
                return "form-control is-valid"
        else:
            return "form-control"

    # Create user clicked, insert into db
    @app.callback(
        Output("createUserSuccess", "children"),
        [
            Input("createUserButton", "n_clicks"),
            Input("newUsername", "n_submit"),
            Input("newPwd1", "n_submit"),
            Input("newPwd2", "n_submit"),
            Input("newEmail", "n_submit"),
        ],
        [
            State("pageContent", "children"),
            State("newUsername", "value"),
            State("newPwd1", "value"),
            State("newPwd2", "value"),
            State("newEmail", "value"),
            State("role", "value"),
        ],
    )
    def createUser(
        n_clicks,
        usernameSubmit,
        newPassword1Submit,
        newPassword2Submit,
        newEmailSubmit,
        pageContent,
        newUser,
        newPassword1,
        newPassword2,
        newEmail,
        role,
    ):
        if (
            (n_clicks > 0)
            or (usernameSubmit > 0)
            or (newPassword1Submit > 0)
            or (newPassword2Submit > 0)
            or (newEmailSubmit > 0)
        ):

            if newUser and newPassword1 and newPassword2 and newEmail != "":
                if newPassword1 == newPassword2:
                    if len(newPassword1) > 7:
                        try:
                            User.add_user(newUser, newPassword1, newEmail, role)
                            return html.Div(
                                children=["New User created"], className="text-success"
                            )
                        except Exception as e:
                            return html.Div(
                                children=["New User not created: {e}".format(e=e)],
                                className="text-danger",
                            )
                    else:
                        return html.Div(
                            children=["New Password Must Be Minimum 8 Characters"],
                            className="text-danger",
                        )
                else:
                    return html.Div(
                        children=["Passwords do not match"], className="text-danger"
                    )
            else:
                return html.Div(
                    children=["Invalid details submitted"], className="text-danger"
                )
