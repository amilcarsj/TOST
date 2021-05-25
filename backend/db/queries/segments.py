from db.db_connection import create_cursor, create_dict_cursor, create_connection
import pandas as pd

conn = create_connection()

def save_segment(segmentation_id, segment_number,  min_x, min_y, max_x, max_y):
  cursor = create_cursor()
  query = """ INSERT INTO segment_v2 (segmentation_id, segment_number, polygon) SELECT %s as segmentation_id, %s as segment_number, * FROM ST_MakeEnvelope(%s, %s, %s, %s) as polygon """
  cursor.execute(query, (segmentation_id, segment_number, min_x, min_y, max_x, max_y))

def load_segments_as_geojson(segmentation_id):
  cursor = create_dict_cursor()
  cursor.execute(f""" SELECT segment_number, ST_AsGeoJSON(polygon) as geojson FROM segment_v2 WHERE segmentation_id = {segmentation_id}; """)
  segments = cursor.fetchall()
  return segments

def load_segments(segmentation_id):
  cursor = create_dict_cursor()
  cursor.execute(f""" SELECT * from segment_v2 WHERE segmentation_id = {segmentation_id}; """)
  segments = cursor.fetchall()
  return segments

def load_trips_data_on_polygon(trip_ids, polygon):
  # query = f"""SELECT *, extract(epoch from timestamp) as timestamp_in_seconds FROM trip_v2 where trip_id in {trip_ids} and ST_Intersects({polygon}, trip_v2.lng_lat);""" %
  # return pd.read_sql_query(query, conn)
  cursor = create_dict_cursor()
  query = """
    SELECT *, extract(epoch from timestamp) as timestamp_in_seconds
    FROM trip_v2
    where trip_id IN %s and ST_Intersects(%s, trip_v2.lng_lat);
  """
  cursor.execute(query, (trip_ids, polygon,))
  result =  cursor.fetchall()
  return pd.DataFrame([i.copy() for i in result])

def save_segment_values_for_trip(segmentation_id, segment_number, trip_id, values):
  cursor = create_cursor()

  query = """ INSERT INTO segment_trip_value_v2 (segmentation_id,
                                              segment_number,
                                              trip_id,
                                              min_speed_in_knots,
                                              avg_speed_in_knots,
                                              max_speed_in_knots,
                                              avg_bearing_in_deg,
                                              distance_in_nm,
                                              duration_in_sec,
                                              interpolation_percentage)
              VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s,%s) ON CONFLICT DO NOTHING;"""

  to_insert = (segmentation_id, segment_number, trip_id, values['min_speed_in_knots'],values['average_speed_in_knots'],
                        values['max_speed_in_knots'],
                        values['average_bearing_in_deg'],
                        values['travel_distance_in_nm'],
                        values['duration_in_seconds'],
                        values['interpolation_percentage'])
  cursor.execute(query,to_insert)
  # cursor.execute(query, (segmentation_id,
  #                       segment_number,
  #                       trip_id,
  #                       values['min_speed_in_knots'],
  #                       values['average_speed_in_knots'],
  #                       values['max_speed_in_knots'],
  #                       values['average_bearing_in_deg'],
  #                       values['travel_distance_in_nm'],
  #                       values['duration_in_seconds'],
  #                       values['interpolation_percentage']))

# def update_segment_values_for_trip(segmentation_id, segment_number, trip_id, interpolation_percentage):
#   cursor = create_cursor()

#   query = f""" UPDATE segment_trip_value_v2 SET interpolation_percentage = {interpolation_percentage} where segmentation_id = {segmentation_id}
#     and segment_number = {segment_number} and trip_id = {trip_id};"""
#   cursor.execute(query)

def load_segment_values_for_trips(segmentation_id, trip_ids):
  cursor = create_cursor()
  query = """SELECT * FROM segment_trip_value_v2 WHERE segmentation_id = %s and trip_id IN %s;"""
  cursor.execute(query, (segmentation_id, trip_ids,))
  return cursor
