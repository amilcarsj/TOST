# this scrip add data to vessel table
from db_connection import DBConnection

db_connection = DBConnection.get_instance().get_connection()
cursor = db_connection.cursor()

def load_vessel_data():
  fetch_cursor = db_connection.cursor()
  query = """ SELECT DISTINCT ON (mmsi) mmsi, ship_type FROM trip_raw; """
  fetch_cursor.execute(query)
  return fetch_cursor

def save_vessel_data(fetch_cursor):
  query = """ INSERT INTO vessel (mmsi, vessel_type) VALUES (%s, %s) ON CONFLICT DO NOTHING; """
  for row in fetch_cursor:
    mmsi = row[0]
    vessel_type = row[1]
    cursor.execute(query, (mmsi, vessel_type))

fetch_cursor = load_vessel_data()
save_vessel_data(fetch_cursor)
