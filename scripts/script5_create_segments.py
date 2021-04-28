# todo: add filter previously so we can remove noise points
# create rectangle segments
# found bounding box
from geopy.distance import geodesic
from db_connection import DBConnection
from postgis.psycopg import register
import psycopg2.extras
import json

db_connection = DBConnection.get_instance().get_connection()
register(db_connection)
cursor = db_connection.cursor(cursor_factory = psycopg2.extras.DictCursor)

num_segments = 10

# in lat long format
def get_bounding_box():
  # query = """ SELECT ST_FlipCoordinates(ST_Envelope(ST_Extent(lng_lat::geometry))) from (select * from trip where trip_id != 331 and trip_id != 492 and trip_id != 2584) as foo; """
  query = """ SELECT min(ST_XMin(lng_lat::geometry)) as min_x,
                     min(ST_YMin(lng_lat::geometry)) as min_y,
                     max(ST_XMax(lng_lat::geometry)) as max_x,
                     max(ST_YMax(lng_lat::geometry)) as max_y from
                      (select * from trip where trip_id != 331 and trip_id != 492 and trip_id != 2584) as foo; """
  cursor.execute(query)
  bounding_box_min_max = cursor.fetchone()
  return bounding_box_min_max

def insert_segment(segment_number, min_x, min_y, max_x, max_y):
  query = """ INSERT INTO segment (segment_number, rect) SELECT %s as segment_number, * FROM ST_MakeEnvelope(%s, %s, %s, %s) as rect """
  cursor.execute(query, (segment_number, min_x, min_y, max_x, max_y))

def create_segments(bounding_box):
  min_x, min_y, max_x, max_y = bounding_box['min_x'], bounding_box['min_y'], bounding_box['max_x'], bounding_box['max_y']
  horizontal_distance = geodesic((min_y, min_x), (min_y, max_x)).nm
  vertical_distance = geodesic((min_y, min_x), (max_y, min_x)).nm

  if horizontal_distance > vertical_distance:
    cur_min_x = min_x
    segment_size = (max_x - min_x) / num_segments

    for index in range(1, num_segments+1):
      cur_max_x = cur_min_x + segment_size
      insert_segment(index, cur_min_x, min_y, cur_max_x, max_y)
      cur_min_x = cur_max_x

  else:
    cur_min_y = min_y
    segment_size = (max_y - min_y) / num_segments

    for index in range(1, num_segments+1):
      cur_max_y = cur_min_y + segment_size
      insert_segment(index, cur_min_y, max_x, cur_max_y)
      cur_min_y = cur_max_y

bounding_box = get_bounding_box()
create_segments(bounding_box)
