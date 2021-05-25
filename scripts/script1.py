# Used to populate the trip_raw table from the raw csv data
import csv
import psycopg2
from db_connection import DBConnection

csv_file_path = 'D:/Projects/TOST/SampleDataset/tais_voyages_sample_hou_nol_points_by_voyage_w_ref.csv'

db_connection = DBConnection.get_instance().get_connection()
cursor = db_connection.cursor()

postgres_insert_query = """ INSERT INTO trip_raw (trip_id, timestamp, mmsi, lng_lat, heading, sog, rot, cog, ship_type) VALUES (%s,%s,%s, %s,%s,%s, %s,%s,%s) ON CONFLICT DO NOTHING;"""
with open(csv_file_path) as csv_file:
  csv_reader = csv.DictReader(csv_file)
  for row in csv_reader:
    trip_id = row['new_voyageid']
    timestamp = row['basedatetime']
    mmsi = row['mmsi']
    lng_lat = "SRID=4326;POINT({} {})".format(row['x'], row['y'])
    heading = row['heading']
    sog = row['sog']
    rot = row['rot']
    cog = row['cog']
    ship_type = row['co_type']

    record_to_insert = (trip_id, timestamp, mmsi, lng_lat, heading, sog, rot,cog, ship_type)
    cursor.execute(postgres_insert_query, record_to_insert)

count = cursor.rowcount
print (count, "Records inserted successfully into trip_raw table")


if(connection):
  cursor.close()
  connection.close()
  print("PostgreSQL connection is closed")
