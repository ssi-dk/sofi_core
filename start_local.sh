# start.sh

export FLASK_APP=main.py
export FLASK_DEBUG=1
export APP_CONFIG_FILE=config.py
export FLASK_RUN_HOST=127.0.0.1
export FLASK_RUN_PORT=8080
flask run
