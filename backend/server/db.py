import psycopg2
import psycopg2.extras

connection = None
# this function has to be called
def create_connection():
  global connection
  connection = psycopg2.connect(database = "tost-db" ,user="postgres", password="12345678")
  connection.autocommit = True

def create_cursor():
  return connection.cursor(cursor_factory = psycopg2.extras.DictCursor)

def create_dict_cursor():
   return connection.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
# cursor = connection.cursor(cursor_factory = psycopg2.extras.DictCursor)
# dict_cursor = connection.cursor(cursor_factory = psycopg2.extras.RealDictCursor)
