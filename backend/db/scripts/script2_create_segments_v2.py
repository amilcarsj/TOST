import sys
import os.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../..") # hack so we can access sibling folder https://stackoverflow.com/questions/6323860/sibling-package-imports
from geopy.distance import geodesic
from db.db_connection import create_connection
from db.queries.trips import load_all_trip_ids, load_bounding_box
from db.queries.segments import save_segment

create_connection()

num_segments = 10
segmentation_id = 1 # this is temporary

def create_segments():
  '''
  Populate trip segment polygons table.
  In the future we should change it so that the user create their own polygons or change this script to create segments
  for different origin-destinations
  '''
  trip_ids = load_all_trip_ids() # need to change to only load trips from the same origin-destination
  bounding_box = load_bounding_box(tuple(trip_ids))
  min_x, min_y, max_x, max_y = bounding_box['min_x'], bounding_box['min_y'], bounding_box['max_x'], bounding_box['max_y']
  horizontal_distance = geodesic((min_y, min_x), (min_y, max_x)).nm
  vertical_distance = geodesic((min_y, min_x), (max_y, min_x)).nm

  if horizontal_distance > vertical_distance:
    cur_min_x = min_x
    segment_size = (max_x - min_x) / num_segments

    for index in range(1, num_segments+1):
      cur_max_x = cur_min_x + segment_size
      save_segment(segmentation_id, index, cur_min_x, min_y, cur_max_x, max_y)
      cur_min_x = cur_max_x

  else:
    cur_min_y = min_y
    segment_size = (max_y - min_y) / num_segments

    for index in range(1, num_segments+1):
      cur_max_y = cur_min_y + segment_size
      save_segment(segmentation_id, index, min_x, cur_min_y, max_x, cur_max_y)
      cur_min_y = cur_max_y

create_segments()
