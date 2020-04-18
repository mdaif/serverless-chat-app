""" Constants file for Auth0's seed project
"""
import os

AUTH0_CLIENT_ID = 'AUTH0_CLIENT_ID'
AUTH0_CLIENT_SECRET = 'AUTH0_CLIENT_SECRET'
AUTH0_CALLBACK_URL = 'AUTH0_CALLBACK_URL'
AUTH0_DOMAIN = 'AUTH0_DOMAIN'
AUTH0_AUDIENCE = 'AUTH0_AUDIENCE'
PROFILE_KEY = 'profile'
SECRET_KEY = 'ThisIsTheSecretKey'
JWT_PAYLOAD = 'jwt_payload'
ID_TOKEN = 'ID_TOKEN'

CHAT_HISTORY_API_ID = os.environ['CHAT_HISTORY_API_ID']
WS_API_ID = os.environ['WS_API_ID']

WEBSOCKET_ENDPOINT = f'wss://{WS_API_ID}.execute-api.eu-central-1.amazonaws.com/dev'
CHAT_HISTORY_ENDPOINT = f'https://{CHAT_HISTORY_API_ID}.execute-api.eu-central-1.amazonaws.com/dev/chat-history'
