import sys
import os.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../..") # hack so we can access sibling folder https://stackoverflow.com/questions/6323860/sibling-package-imports
from geopy.distance import geodesic
from db.db_connection import create_connection
from db.queries.segments import load_segments, load_trips_data_on_polygon
from db.queries.trips import load_all_trip_ids
from bearing import calculate_mean_bearing

create_connection()

def calculate_segment_values(segmentation_id):
  segments = load_segments(segmentation_id)
  trip_ids = tuple([270]) # refactor this to load only trajectories that belong to this segmentation (same origin-destination)
  for segment in segments:
    polygon = segment['polygon']
    trips_data_on_segment_df = load_trips_data_on_polygon(trip_ids, polygon)
    for trip_id in [270]:
      try:
        trip_on_segment_df = get_trip_df(trips_data_on_segment_df, trip_id)
        print(trip_on_segment_df)
        interpolation = calculate_trip_values_on_segment(trip_on_segment_df)
        # update_segment_values_for_trip(segmentation_id, segment['segment_number'], trip_id, interpolation)
      except:
        print(f'failed to update segment values for trip_id<{trip_id}> on segment<{segment["segment_number"]}>')

def get_trip_df(trips_df, trip_id):
  trip_df = trips_df[trips_df['trip_id'] == trip_id]
  trip_df = trip_df.sort_values(by=['timestamp_in_seconds'])
  return trip_df

def calculate_trip_values_on_segment(trip_df):
  if len(trip_df) <= 1:
    return None

  interpolation_percentage = len(trip_df[trip_df['interpolated'] == True]) / len(trip_df)

  return interpolation_percentage

calculate_segment_values(1)

