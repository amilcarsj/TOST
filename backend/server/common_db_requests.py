from server.db import create_cursor, create_dict_cursor

def get_all_trip_ids():
  cursor = create_cursor()
  query = """ SELECT trip_id FROM trip_info; """
  cursor.execute(query)
  return cursor.fetchall()
