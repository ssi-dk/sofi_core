"""Routes for parent Flask app."""
from flask import render_template
from flask import current_app as app


@app.route('/test_flask')
def home():
    """Landing page."""
    return render_template(
        'index.jinja2',
        title='Startside',
        description='Dash embedded into flask',
        template='home-template',
        body="This is a homepage served with Flask."
    )
