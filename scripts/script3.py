#todo allow a file path be passed as argument
# indentify valid routes by clustering first and last positions
import csv
from geopy.distance import geodesic
from db_connection import DBConnection

csv_file_path = 'D:/Projects/TOST/SampleDataset/tais_voyages_sample_hou_nol.csv'
connection = None

db_connection = DBConnection.get_instance().get_connection()
cursor = db_connection.cursor()

# max distance a route can start of finish from a port
max_distance_from_port_in_nm = 10
postgres_select_first_row = """ SELECT ST_Y(lng_lat::geometry) AS lat, ST_X(lng_lat::geometry) AS lng FROM trip_raw WHERE trip_id = %s ORDER BY timestamp ASC LIMIT 1;"""
postgres_select_last_row = """ SELECT ST_Y(lng_lat::geometry) AS lat, ST_X(lng_lat::geometry) AS lng FROM trip_raw WHERE trip_id = %s ORDER BY timestamp DESC LIMIT 1;"""
# this checks if the first and last positions of a vessel match the origin and destination port location
def tripHasStartAndEndAtCorrectLocation(trip_id, origin_port_lat_lng, destination_port_lat_lng):
  # This needs to be a tuple: https://stackoverflow.com/questions/21524482/psycopg2-typeerror-not-all-arguments-converted-during-string-formatting
  cursor.execute(postgres_select_first_row, (trip_id,))
  start_lat_lng = cursor.fetchone()
  cursor.execute(postgres_select_last_row, (trip_id,))
  end_lat_lng = cursor.fetchone()
  if geodesic(start_lat_lng, origin_port_lat_lng).nm <= 10 and geodesic(end_lat_lng, destination_port_lat_lng).nm <= 10:
    return True
  return False

houston_port_lat_lng = (29.748803, -95.102199)
new_orleans_port_lat_lng = (29.934020, -90.059495)
def get_origin_port_lat_lng(port_name):
  if port_name == 'HOUSTON':
    return houston_port_lat_lng
  elif port_name == 'NEW ORLEANS':
    return new_orleans_port_lat_lng
  else:
    raise Exception('Invalid Port', port)

# Todo check for timestamp errors: eg: trip id 563 and 2987
# Invalid trips 1616
# delete from trip_info where trip_id = 1305;
# delete from trip_info where trip_id = 1508;
# delete from trip_info where trip_id = 1737;
# delete from trip_info where trip_id = 1008;
# delete from trip_info where trip_id = 1337;
# on those cases the timestamps go back one day after certain point
def isTripValid(trip_id, origin, destination):
  origin_port_lat_lng = get_origin_port_lat_lng(origin)
  destination_port_lat_lng = get_origin_port_lat_lng(destination)
  isValidTrip = tripHasStartAndEndAtCorrectLocation(trip_id, origin_port_lat_lng, destination_port_lat_lng)
  return isValidTrip

insert_into_trip_info_query = """ INSERT INTO trip_info (trip_id, mmsi, eta, origin, destination) VALUES (%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING; """
with open(csv_file_path) as csv_file:
  csv_reader = csv.DictReader(csv_file)

  for row in csv_reader:
    trip_id = row['new_voyageid']
    origin = row['prev_dest']
    destination = row['curr_dest']
    isValidTrip = isTripValid(trip_id, origin, destination)
    if isValidTrip:
      mmsi = row['mmsi']
      eta = row['curr_eta']
      cursor.execute(insert_into_trip_info_query, (trip_id, mmsi, eta, origin, destination))
