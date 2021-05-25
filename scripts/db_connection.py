import psycopg2
from singleton import Singleton

@Singleton
class DBConnection(object):

    def __init__(self):
        """Initialize your database connection here."""
        try:
            connection = psycopg2.connect(database = "tost-db", user="postgres", password="12345678")
            connection.autocommit = True
            self.connection = connection
        except (Exception, psycopg2.Error) as error :
            print ("Error while connecting to PostgreSQL", error)

    def get_connection(self):
        return self.connection

    def __str__(self):
        return self.connection
