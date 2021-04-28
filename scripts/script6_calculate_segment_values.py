import sys
from db_connection import DBConnection
import psycopg2.extras

db_connection = DBConnection.get_instance().get_connection()
cursor = db_connection.cursor(cursor_factory = psycopg2.extras.DictCursor)

def get_segments():
  query = """ SELECT * FROM segment; """
  cursor.execute(query)
  segments = cursor.fetchall()
  return segments

def get_trips_id():
  trips = []
  query = """ SELECT trip_id FROM trip_info; """
  cursor.execute(query)

  for row in cursor:
    trip_id = row['trip_id']
    trips.append(trip_id)

  return trips

def calculate_trip_values_for_polygon(trip_id, polygon):
  query = """
    SELECT *, extract(epoch from timestamp) as timestamp_in_seconds
    FROM trip
    where trip_id = %s and ST_Intersects(%s, trip.lng_lat);
  """
  cursor.execute(query, (trip_id, polygon,))

  row_count = 0
  min_sog = sys.maxsize
  max_sog = 0
  sog_sum = 0
  duration_in_sec = 0
  start_heading = None
  end_heading = None
  min_heading = sys.maxsize
  max_heading = 0
  first_timestamp_in_sec = None

  for row in cursor:
    heading = row['heading']
    sog = row['sog']
    cog = row['cog']

    row_count += 1
    sog_sum += sog

    if first_timestamp_in_sec == None:
      first_timestamp_in_sec = row['timestamp_in_seconds']
    if sog < min_sog:
      min_sog = sog
    if sog > max_sog:
      max_sog = sog

    if heading < min_heading:
      min_heading = heading
    if heading > max_heading:
      max_heading = heading

    if start_heading == None:
      start_heading = heading

  # there is no data points in that segment
  if row_count == 0:
    return (0, 0, 0, 0, 0, 0, 0, 0)


  avg_sog = sog_sum / row_count
  end_heading = row['heading']
  total_distance_in_nm = row['travel_distance_in_nm']
  trip_duration_in_sec = row['timestamp_in_seconds'] - first_timestamp_in_sec
  max_heading_change = max_heading - min_heading

  return (min_sog, max_sog, avg_sog, total_distance_in_nm, trip_duration_in_sec,
                              start_heading, end_heading, max_heading_change)

def save_segment_values_for_trip(segment_number, trip_id, min_sog, max_sog, avg_sog, distance_in_nm, duration_in_sec,
                                  start_heading, end_heading, max_heading_change):

  query = """ INSERT INTO segment_trip_value (segment_number,
                                              trip_id,
                                              min_sog,
                                              max_sog,
                                              avg_sog,
                                              distance_in_nm,
                                              duration_in_sec,
                                              start_heading,
                                              end_heading,
                                              max_heading_change)
                VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT DO NOTHING;"""
  cursor.execute(query, (segment_number, trip_id, min_sog, max_sog, avg_sog, distance_in_nm, duration_in_sec,
                                  start_heading, end_heading, max_heading_change))

def calculate_segment_values_for_each_trip():
  segments = get_segments()
  trips_id = get_trips_id()

  for segment_number, polygon in segments:
    for trip_id in trips_id:
      values = calculate_trip_values_for_polygon(trip_id, polygon)
      save_segment_values_for_trip(segment_number, trip_id, *values)

calculate_segment_values_for_each_trip()

