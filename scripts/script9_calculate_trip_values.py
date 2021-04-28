from geopy.distance import geodesic
from calc_helper import calculate_initial_compass_bearing
from db_connection import DBConnection
import psycopg2.extras
import numpy as np
import pandas as pd

db_connection = DBConnection.get_instance().get_connection()
cursor_read = db_connection.cursor(cursor_factory = psycopg2.extras.DictCursor)
cursor_write = db_connection.cursor()

# too many repetitions I need to refactor this code or event change it to load all rows from trip table in PANDAS (maybe it will use too much memory)
def get_valid_trips():
  valid_trips = set()
  query = """ SELECT trip_id FROM trip_info; """
  cursor_read.execute(query)

  for row in cursor_read:
    trip_id = row['trip_id']
    valid_trips.add(trip_id)

  return valid_trips

def load_trip(trip_id):
  get_trip_query = """ SELECT EXTRACT(epoch FROM timestamp) as timestamp_in_seconds, ST_Y(lng_lat::geometry) AS lat, ST_X(lng_lat::geometry) AS lng FROM trip_v2 WHERE trip_id = %s ORDER BY timestamp ASC; """
  cursor_read.execute(get_trip_query, (trip_id,))
  rows = cursor_read.fetchall()
  return rows

def update_row(trip_id, timestamp, speed_in_knots, bearing_in_deg, travel_distance_in_nm):
  update_query = """ UPDATE trip_v2 SET (speed_in_knots, bearing_in_deg, travel_distance_in_nm) VALUES (%s,%s, %s) WHERE trip_id = %s and timestamp = to_timestamp(%s) ON CONFLICT DO NOTHING;"""
  record_to_update = (speed_in_knots, bearing_in_deg, travel_distance_in_nm, trip_id, timestamp)
  cursor_write.execute(update_query, record_to_update)

def calculate_additional_attr(rows):
  last_pos = None
  last_timestamp = None
  acc_distance_in_nm = 0
  for row in cursor_read:
    timestamp_in_seconds = row['timestamp_in_seconds']
    lat_lng = (row['lat'], row['lng'])

    if last_pos:
      bearing = calculate_initial_compass_bearing(last_pos, lat_lng)
      distance_from_last_point = geodesic(lat_lng, last_pos).nm
      timestamp_diff_in_hours = (timestamp_in_seconds - last_timestamp) / 60 / 60
      speed_in_knots = distance_from_last_point / timestamp_diff_in_hours
      acc_distance_in_nm += distance_from_last_point
      update_row(trip_id, timestamp_in_seconds, speed_in_knots, bearing, acc_distance_in_nm)

    last_pos = lat_lng
    last_timestamp = timestamp_in_seconds

def calculate_attr():
  trips = get_valid_trips()

  for trip_id in trips:
    rows = load_trip(trip_id)

