import sys
import os.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../..") # hack so we can access sibling folder https://stackoverflow.com/questions/6323860/sibling-package-imports
from geopy.distance import geodesic
from db.db_connection import create_connection
from db.queries.segments import load_segments, load_trips_data_on_polygon, save_segment_values_for_trip
from db.queries.trips import load_all_trip_ids
from bearing import calculate_mean_bearing

create_connection()

def calculate_segment_values(segmentation_id):
  segments = load_segments(segmentation_id)
  trip_ids = tuple(load_all_trip_ids()) # refactor this to load only trajectories that belong to this segmentation (same origin-destination)
  for segment in segments:
    polygon = segment['polygon']
    trips_data_on_segment_df = load_trips_data_on_polygon(trip_ids, polygon)
    for trip_id in trip_ids:
      try:
        trip_on_segment_df = get_trip_df(trips_data_on_segment_df, trip_id)
        trip_segment_values = calculate_trip_values_on_segment(trip_on_segment_df)
        save_segment_values_for_trip(segmentation_id, segment['segment_number'], trip_id, trip_segment_values)
      except:
        print(f'failed to calculate segment values for trip_id<{trip_id}> on segment<{segment["segment_number"]}>')

def get_trip_df(trips_df, trip_id):
  trip_df = trips_df[trips_df['trip_id'] == trip_id]
  trip_df = trip_df.sort_values(by=['timestamp_in_seconds'])
  return trip_df

def calculate_trip_values_on_segment(trip_df):
  if len(trip_df) <= 1:
    return {
      'min_speed_in_knots': None,
      'max_speed_in_knots': None,
      'average_speed_in_knots': None,
      'average_bearing_in_deg': None,
      'duration_in_seconds': None,
      'travel_distance_in_nm': None,
      'interpolation_percentage': None
    }

  first_row = trip_df.head(1).iloc[0] # iloc to access the single row
  last_row = trip_df.tail(1).iloc[0]
  min_speed_in_knots = trip_df['speed_in_knots'].min()
  max_speed_in_knots = trip_df['speed_in_knots'].max()
  average_speed_in_knots = trip_df['speed_in_knots'].mean()
  duration_in_seconds = last_row['timestamp_in_seconds'] - first_row['timestamp_in_seconds']
  travel_distance_in_nm = last_row['travel_distance_in_nm'] - first_row['travel_distance_in_nm']
  trip_df_with_bearing_values = trip_df[trip_df['bearing_in_deg'].notnull()]
  average_bearing_in_deg = calculate_mean_bearing(list(trip_df_with_bearing_values['bearing_in_deg']))
  interpolation_percentage = len(trip_df[trip_df['interpolated'] == True]) / len(trip_df)

  return {
    'min_speed_in_knots': min_speed_in_knots,
    'max_speed_in_knots': max_speed_in_knots,
    'average_speed_in_knots': average_speed_in_knots,
    'average_bearing_in_deg': average_bearing_in_deg,
    'duration_in_seconds': duration_in_seconds,
    'travel_distance_in_nm': travel_distance_in_nm,
    'interpolation_percentage': interpolation_percentage
  }

calculate_segment_values(1)

