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
  get_trip_query = """ SELECT *, ST_Y(lng_lat::geometry) AS lat, ST_X(lng_lat::geometry) AS lng FROM trip_raw WHERE trip_id = %s ORDER BY timestamp ASC; """

  for trip_id in valid_trips:
    cursor_read.execute(get_trip_query, (trip_id,))
    last_pos = None
    acc_distance_in_nm = 0
    for row in cursor_read:
      timestamp = row['timestamp']
      lat_lng = (row['lat'], row['lng'])
      lng_lat_geom = row['lng_lat']
      heading = row['heading']
      sog = row['sog']
      rot = row['rot']
      cog = row['cog']
      if last_pos:
        distance_from_last_point = geodesic(lat_lng, last_pos).nm
        acc_distance_in_nm += distance_from_last_point
      last_pos = lat_lng

      record_to_insert = (trip_id, timestamp, lng_lat_geom, heading, sog, rot,cog, acc_distance_in_nm)
      insert_query = """ INSERT INTO trip (trip_id, timestamp, lng_lat, heading, sog, rot, cog, travel_distance_in_nm) VALUES (%s,%s,%s, %s,%s,%s, %s,%s) ON CONFLICT DO NOTHING;"""
      cursor_write.execute(insert_query, record_to_insert)

valid_trips = get_valid_trips()
populate_trip_db(valid_trips)
