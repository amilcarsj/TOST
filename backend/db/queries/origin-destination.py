from db.db_connection import create_cursor, create_dict_cursor, create_connection

conn = create_connection()

def load_origin_destinations():
  cursor = create_dict_cursor()
  cursor.execute(""" SELECT DISTINCT origin, destination from trip_info; """) # this should be refactor to have its own table itinerary
  origin_destinations = cursor.fetchall()
  return origin_destinations
