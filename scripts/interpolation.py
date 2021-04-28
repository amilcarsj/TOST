import numpy as np
import pandas as pnd
# from math import cos, sin, atan2, degrees, radians
from kinematic_interpolation import kinematic_interpolation

interval_between_interpolations_in_sec = 180

def interpolate(trip_df):
  '''
  For each gap of 6 minutes or longer this function will interpolate with a 3 minute interval
  '''
  interpolated_trip_df = trip_df.copy()['interpolated'] = False

  prev_timestamp = None
  for index in range(len(trip_df)):
    row = trip_df[index]
    current_timestamp = row['timestamp_in_seconds']

    if prev_timestamp != None:
      time_diff = current_timestamp -  prev_timestamp

      if time_diff > interval_between_interpolations_in_sec * 2: # 6 min
        xytvv = get_xytvv(trip_df, index-1, index)
        times = get_times(trip_df[index-1], row)
        local_interpolation_df = kinematic_interpolation(xytvv, times)
        formated_local_interpolation_df = format_interpolated_df(local_interpolation_df)
        interpolated_trip_df = interpolated_trip_df.append(formated_local_interpolation_df, ignore_index=True)

    prev_timestamp = current_timestamp

def format_interpolated_df(interpolated_df):
  formated_df = interpolated_df.rename(columns={'x':'lng', 'y': 'lat', 't': 'timestamp_in_seconds'})
  formated_df['interpolated'] = True
  return formated_df

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

def pos(t, x1, v1, b, c):
    return x1 + v1*t + (t**2)*b/2 + (t**3)*c/6



# Needs to calculate heading | sog | rot | cog  | travel_distance_in_nm
def derive_interpolation_attributes(row_a, row_b, interpolation):
    prev_lat_lng = (row['lat'], row['lng'])
    prev_timestamp = row_a['timestamp_in_seconds']
    interpolation_with_attr = []

    for row in interpolation:
        cur_lat_lng = (interpolation['y'], interpolation['x'])

# # https://www.movable-type.co.uk/scripts/latlong.html
# # https://www.igismap.com/formula-to-find-bearing-or-heading-angle-between-two-points-latitude-longitude/
# def calc_bearing(point_a, point_b):
#     rad_lat_1, rad_lng_1 = radians(point_a[0]), radians(point_a[1])
#     rad_lat_2, rad_lng_2 = radians(point_b[0]), radians(point_b[1])

#     x = cos(rad_lat_2) * sin(rad_lng_2 - rad_lng_1)
#     y = cos(rad_lat_1) * sin(rad_lat_2) - sin(rad_lat_1) * cos(rad_lat_2) * cos(rad_lng_2 - rad_lng_1)
#     beta = atan2(x, y)
#     return (degrees(beta) + 360) % 360
