from flask_cors import CORS
from flask import Flask, escape, request
from db.db_connection import create_connection
from server import db

app = Flask(__name__, static_folder='../../frontend/build', static_url_path='/') # the name of the module, to look where to look for templates and static files
app.config['SECRET_KEY'] = '\x8f\x90\xbb\xc6C\xa0\xe1*%\x846\x84\x86\xb3\xce\x81'
CORS(app) # allows all domains to talk to this server
app.config['CORS_HEADERS'] = 'Content-Type'

# create_connection2()
db.create_connection()
create_connection()

# import psycopg2
# import psycopg2.extras

# connection = psycopg2.connect(database = "thesis")
# connection.autocommit = True
# cursor = connection.cursor(cursor_factory = psycopg2.extras.DictCursor)
# dict_cursor = connection.cursor(cursor_factory = psycopg2.extras.RealDictCursor)

from server import routes
from server.routes1 import segment
