from db.db_connection import create_connection, create_cursor, create_dict_cursor
import pandas as pd

conn = create_connection()

def load_all_trip_ids():
  '''
  Return list of trip ids
  '''
  cursor = create_cursor()
  query = 'SELECT trip_id FROM trip_info;'
  cursor.execute(query)
  rows = cursor.fetchall()
  return map(lambda row : row[0], rows)

def load_raw_trip(trip_id):
  '''
  Retuns df representing trip with lat, long and timestamp_in_millis
  '''
  query = f'SELECT EXTRACT(epoch FROM timestamp) as timestamp_in_seconds, ST_Y(lng_lat::geometry) AS lat, ST_X(lng_lat::geometry) AS lng FROM trip_raw WHERE trip_id = {trip_id} ORDER BY timestamp ASC;'
  return pd.read_sql_query(query, conn)

def save_trip(trip_id, trip_df):
  '''
  Save trip dataframe to trip_v2 table
  '''
  cursor = create_cursor()
  query = 'INSERT INTO trip_v2 (trip_id, timestamp, lng_lat, interpolated, speed_in_knots, bearing_in_deg, travel_distance_in_nm) VALUES (%s, to_timestamp(%s),%s, %s, %s, %s, %s) ON CONFLICT DO NOTHIN;'
  for index, row in trip_df.iterrows():
    lng_lat = "SRID=4326;POINT({} {})".format(row['lng'], row['lat'])
    timestamp = row['timestamp_in_seconds']
    interpolated = row['interpolated']
    speed_in_knots = row['speed_in_knots']
    bearing_in_deg = row['bearing_in_deg']
    travel_distance_in_nm = row['travel_distance_in_nm']
    to_insert = (trip_id, timestamp, lng_lat, interpolated, speed_in_knots, bearing_in_deg, travel_distance_in_nm)
    cursor.execute(query, to_insert)

def load_trip(trip_id):
  '''
  Retuns df representing trip with lat, long and timestamp_in_millis
  '''
  cursor = create_dict_cursor()
  query = f'SELECT *,  ST_Y(lng_lat::geometry) AS lat, ST_X(lng_lat::geometry) AS lng FROM trip_v2 WHERE trip_id= {trip_id} ORDER BY timestamp ASC;'
  cursor.execute(query)
  return cursor.fetchall()

def load_trip_trajectory(trip_id):
  '''
  Returns trajectory lat, lng and interpolated
  '''
  cursor = create_dict_cursor()
  query = f'SELECT ST_Y(lng_lat::geometry) AS lat, ST_X(lng_lat::geometry) AS lng, interpolated FROM trip_v2 WHERE trip_id = {trip_id} ORDER BY timestamp ASC;'
  cursor.execute(query)
  return cursor.fetchall()

def load_trip_ids_on_trajectory(origin, destination):
  '''
  Returns trajectories which travel from origin to destination.
  '''
  cursor = create_dict_cursor()
  query =  f'SELECT trip_id FROM trip_info WHERE origin = {origin} and destination = {destination};'
  cursor.execute(query)
  return cursor.fetchone()

def load_bounding_box(trip_ids):
  cursor = create_dict_cursor()
  query = f""" SELECT min(ST_XMin(lng_lat::geometry)) as min_x,
                     min(ST_YMin(lng_lat::geometry)) as min_y,
                     max(ST_XMax(lng_lat::geometry)) as max_x,
                     max(ST_YMax(lng_lat::geometry)) as max_y FROM
                     trip_v2 WHERE trip_id IN {trip_ids} and interpolated = False;"""
  cursor.execute(query)
  bounding_box_min_max = cursor.fetchone()
  return bounding_box_min_max

