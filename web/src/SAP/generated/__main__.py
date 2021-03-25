import connexion

from . import encoder


def create_app():
    app = connexion.App(__name__, specification_dir='./openapi/')
    app.app.json_encoder = encoder.JSONEncoder
    app.add_api('openapi.yaml',
                arguments={'title': 'SOFI'},
                pythonic_params=True)
    return app.app

if __name__ == '__main__':
    main()
