# start.sh

export FLASK_APP=wsgi.py
export FLASK_DEBUG=1
export APP_CONFIG_FILE=config.py
export FLASK_RUN_HOST=0.0.0.0
export FLASK_RUN_PORT=80
flask run
