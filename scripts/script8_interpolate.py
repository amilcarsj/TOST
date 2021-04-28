# This script interpolate gaps in trajectories
# It assumes there is no outliers in the data set in between gaps
from interpolation import kinematic_interpolation
from geopy.distance import geodesic
from db_connection import DBConnection
import psycopg2.extras
import numpy as np
import pandas as pd

db_connection = DBConnection.get_instance().get_connection()
cursor_read = db_connection.cursor(cursor_factory = psycopg2.extras.DictCursor)
cursor_write = db_connection.cursor()


def get_timestamp(row):
  return row['timestamp_in_seconds']

# Calculates speeds on X and Y between two coordinates, which is represented by indexes where these points are located in
# the list of rows
def calc_speed(rows, index_a, index_b):
    is_out_limits = index_a < 0 or index_b >= len(rows) # this happens when measuring the speed on the first or last point
    if (is_out_limits):
      return [0, 0]
    row_a = rows[index_a]
    row_b = rows[index_b]
    timediff = get_timestamp(row_b) - get_timestamp(row_a)
    x_speed = (row_b['lng'] - row_a['lng']) / timediff
    y_speed = (row_b['lat'] - row_a['lat']) / timediff
    return [x_speed, y_speed]

# Generates a number of timestamps in seconds in between two coordinates. The timestamps are generated
# with a fixed interval between them
def get_times(row_a, row_b):
    interval_between_interpolations_in_sec = 180
    times = []
    row_a_timestamp_in_sec = get_timestamp(row_a)
    row_b_timestamp_in_sec = get_timestamp(row_b)
    interpolation_time_in_sec = row_a_timestamp_in_sec + interval_between_interpolations_in_sec

    while (interpolation_time_in_sec < row_b_timestamp_in_sec):
        times.append(interpolation_time_in_sec)
        interpolation_time_in_sec += interval_between_interpolations_in_sec

    return times

def get_xytvv_for_row(row, speed):
    return [row['lng'], row['lat'], get_timestamp(row), speed[0], speed[1]]

# a 2x5 array containing the coordinates, times, and initial and final velocities (as 2D vectors)
# of the two points (a,b) to be interpolated between
def get_xytvv(rows, index_point_a, index_point_b):
  row_a = rows[index_point_a]
  row_b = rows[index_point_b]
  point_a_xy_speeds = calc_speed(rows,index_point_a - 1, index_point_a) # calculate x and y speed on the point right before the gap
  point_b_xy_speeds = calc_speed(rows, index_point_b, index_point_b + 1) # calculate speed on the point after the gap
  xytvv_a = get_xytvv_for_row(row_a, point_a_xy_speeds)
  xytvv_b = get_xytvv_for_row(row_b, point_b_xy_speeds)
  xytvv = np.array([xytvv_a, xytvv_b])

  return xytvv

def get_valid_trips():
  valid_trips = set()
  query = """ SELECT trip_id FROM trip_info; """
  cursor_read.execute(query)

  for row in cursor_read:
    trip_id = row['trip_id']
    valid_trips.add(trip_id)

  return valid_trips

def calculate_interpolations_for_trip_as_df(rows):
  interpolated_df = None
  prev_lat_lng = None
  for index in range(len(rows)):
    row = rows[index]
    cur_lat_lng = (row['lat'], row['lng'])

    if prev_lat_lng == None:
      prev_lat_lng = cur_lat_lng
      continue

    distance = geodesic(prev_lat_lng, cur_lat_lng).nm # 1nm == 1.852 km

    if distance > 5.4: # ~10km
      xytvv = get_xytvv(rows, index-1, index)
      times = get_times(rows[index-1], row)
      interpolated_points = kinematic_interpolation(xytvv, times)
      if interpolated_df is None:
        interpolated_df = interpolated_points
      else:
        interpolated_df = interpolated_df.append(interpolated_points, ignore_index=True)

    prev_lat_lng = cur_lat_lng

  return interpolated_df

def save_interpolation(trip_id, df):
  insert_query = """ INSERT INTO trip_v2 (trip_id, timestamp, lng_lat, interpolated) VALUES (%s, to_timestamp(%s),%s, %s) ON CONFLICT DO NOTHING;"""

  for index, row in df.iterrows():
    lng_lat = "SRID=4326;POINT({} {})".format(row['x'], row['y'])
    timestamp = row['t']
    record_to_insert = (trip_id, timestamp, lng_lat, False)
    cursor_write.execute(insert_query, record_to_insert)


def interpolate_and_save(valid_trips):
  get_trip_query = """ SELECT *, EXTRACT(epoch FROM timestamp) as timestamp_in_seconds, ST_Y(lng_lat::geometry) AS lat, ST_X(lng_lat::geometry) AS lng FROM trip_v2 WHERE trip_id = %s ORDER BY timestamp ASC; """

  for trip_id in valid_trips:
    interpolated_rows = []
    cursor_read.execute(get_trip_query, (trip_id,))
    rows = cursor_read.fetchall()
    interpolated_df = calculate_interpolations_for_trip_as_df(rows)
    save_interpolation(trip_id, interpolated_df)
