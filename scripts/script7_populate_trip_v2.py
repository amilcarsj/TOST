# from kinematic_interpolation import kinematic_interpolation
# load valid trips
# for each row calculate distance from previous point, calculate speed
from geopy.distance import geodesic
from db_connection import DBConnection
import psycopg2.extras

db_connection = DBConnection.get_instance().get_connection()
cursor_read = db_connection.cursor(cursor_factory = psycopg2.extras.DictCursor)
cursor_write = db_connection.cursor()


def get_valid_trips():
  valid_trips = set()
  query = """ SELECT trip_id FROM trip_info; """
  cursor_read.execute(query)

  for row in cursor_read:
    trip_id = row['trip_id']
    valid_trips.add(trip_id)

  return valid_trips

def populate_trip_db(valid_trips):
  get_trip_query = """ SELECT * FROM trip_raw WHERE trip_id = %s ORDER BY timestamp ASC; """

  for trip_id in valid_trips:
    cursor_read.execute(get_trip_query, (trip_id,))
    for row in cursor_read:
      timestamp = row['timestamp']
      lng_lat_geom = row['lng_lat']
      heading = row['heading']
      sog = row['sog']
      rot = row['rot']
      cog = row['cog']

      record_to_insert = (trip_id, timestamp, lng_lat_geom, heading, sog, rot, cog, False)
      insert_query = """ INSERT INTO trip_v2 (trip_id, timestamp, lng_lat, heading, sog, rot, cog, interpolated) VALUES (%s, %s,%s, %s,%s,%s, %s,%s) ON CONFLICT DO NOTHING;"""
      cursor_write.execute(insert_query, record_to_insert)

valid_trips = get_valid_trips()
populate_trip_db(valid_trips)


