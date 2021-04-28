import sys
sys.path.append('../../') # hack so we can access sibling folder https://stackoverflow.com/questions/4383571/importing-files-from-different-folder
from db.db_connection import create_connection
from db.queries.trips import load_all_trip_ids, load_raw_trip, save_trip
from hampel_filter import hampel_filter_pandas
from interpolation import interpolate
from geopy.distance import geodesic
from bearing import calculate_initial_compass_bearing
import numpy as np
import logging

create_connection()

def populate_trip_table():
  '''
  It is good to remove duplicated before removing outliers depending on the method used to remove outliers (eg: using speed instead of lat,lng).
  The methods below do not produce side effect
  '''
  trip_ids = load_all_trip_ids()
  for trip_id in trip_ids:
    try:
      trip_df = load_raw_trip(trip_id)
      trip_df = remove_rows_with_duplicated_timestamp(trip_df)
      trip_df = remove_outliers(trip_df)
      trip_df = interpolate(trip_df)
      trip_df = calculate_additional_attributes(trip_df)
      save_trip(trip_id, trip_df)
    except:
      print(trip_id)

  print('trip table have been correctly populated')

def remove_rows_with_duplicated_timestamp(trip_df):
  trip_without_duplicates = trip_df.drop_duplicates(subset='timestamp_in_seconds', keep="first")
  return trip_without_duplicates.reset_index(drop=True)

def remove_outliers(trip_df):
  '''
  This function looks for latitudinal and longitudinal anomalies. We use a window size of 10 and n_sigmas equal to 5, since
  we just want to remove extreme outliers. hampel_filter_pandas return a list of indices of the anomalies it found.
  '''
  window_size, n_sigmas = 10, 5
  lat_values = trip_df['lat']
  lng_values = trip_df['lng']
  lat_outliers = hampel_filter_pandas(lat_values, window_size, n_sigmas)
  lng_outliers = hampel_filter_pandas(lng_values, window_size, n_sigmas)
  outliers_index_list = lat_outliers + lng_outliers
  trip_without_outliers = trip_df.drop(outliers_index_list)
  return trip_without_outliers.reset_index(drop=True)

def calculate_additional_attributes(trip_df):
  '''
  It calculates speed and bearing for each row and adds accumlate distance navigated so far
  '''
  updated_trip_df = trip_df.copy()

  last_pos = None
  last_timestamp = None
  acc_distance_in_nm = 0
  for index in updated_trip_df.index:
    row =  updated_trip_df.loc[index]
    timestamp_in_seconds = row['timestamp_in_seconds']
    lat_lng = (row['lat'], row['lng'])

    if last_pos:
      bearing = calculate_initial_compass_bearing(last_pos, lat_lng)
      distance_from_last_point = geodesic(lat_lng, last_pos).nm
      timestamp_diff_in_hours = (timestamp_in_seconds - last_timestamp) / 60 / 60
      speed_in_knots = distance_from_last_point / timestamp_diff_in_hours
      acc_distance_in_nm += distance_from_last_point
      updated_trip_df.loc[index, 'speed_in_knots'] = speed_in_knots
      updated_trip_df.loc[index, 'bearing_in_deg'] = bearing if bearing > 0 else None
      updated_trip_df.loc[index, 'travel_distance_in_nm'] = acc_distance_in_nm
    else:
      updated_trip_df.loc[index, 'speed_in_knots'] = 0
      updated_trip_df.loc[index, 'bearing_in_deg'] = None
      updated_trip_df.loc[index, 'travel_distance_in_nm'] = 0

    last_pos = lat_lng
    last_timestamp = timestamp_in_seconds

  updated_trip_df.replace({ np.nan: None }, inplace=True) # pandas convert bearing none to nan, so we convert it back
  return updated_trip_df

populate_trip_table()
