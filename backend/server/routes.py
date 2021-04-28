from server.db import create_cursor, create_dict_cursor
from server import app, mean_route_mock
from flask import jsonify, request
import json
import numpy as np
import csv
from scipy import stats
from db.db_connection import create_connection
from db.queries.trips import load_trip_trajectory, load_trip
from db.queries.segments import load_segments

create_connection()

@app.route('/date-range')
def min_max_date_in_millis():
  cursor = create_cursor()
  cursor.execute(""" SELECT extract(epoch from timestamp) * 1000 as timestamp_in_millis from trip ORDER BY timestamp ASC limit 1; """)
  first_timestamp = int(cursor.fetchone()['timestamp_in_millis'])
  cursor.execute(""" SELECT extract(epoch from timestamp) * 1000 as timestamp_in_millis from trip ORDER BY timestamp DESC limit 1; """)
  last_timestamp = int(cursor.fetchone()['timestamp_in_millis'])
  return jsonify(
    start = first_timestamp,
    end = last_timestamp
  )

@app.route('/origin-destinations')
def origin_destinations():
  cursor = create_dict_cursor()
  cursor.execute(""" SELECT DISTINCT origin, destination from trip_info; """) # this should be refactor to have its own table itinerary
  origin_destination = cursor.fetchall()
  return jsonify(origin_destination)

@app.route('/vessel-types')
def vessel_types():
  cursor = create_cursor()
  cursor.execute(""" SELECT DISTINCT vessel_type FROM vessel; """)
  vessel_types = sorted([row[0] for row in cursor.fetchall()])
  return jsonify(vessel_types)

@app.route('/segments')
def segments():
  cursor = create_dict_cursor()
  cursor.execute(""" SELECT segment_number, ST_AsGeoJSON(rect) as geojson FROM segment; """)
  segments = cursor.fetchall()

  def format_segment(segment):
    coordinates = json.loads(segment['geojson'])['coordinates'][0] # the coordinates comes inside an extra array and the geojson is a string
    lat_lng_coordinates = list(map(lambda coord : { 'lat': coord[1], 'lng': coord[0] }, coordinates))
    return { 'segment_number': segment['segment_number'], 'coordinates': lat_lng_coordinates }

  formated_segments = list(map(format_segment, segments))
  return jsonify(formated_segments)


@app.route('/avg-route')
def avg_route():
  cursor = create_dict_cursor()
  cursor.execute(""" SELECT segment_number, ST_AsGeoJSON(rect) as geojson FROM segment; """)
  segments = cursor.fetchall()


@app.route('/segment-values')
def segment_values():
  cursor = create_dict_cursor()
  from_timestamp = int(request.args.get('from')) / 1000
  to_timestamp = int(request.args.get('to')) / 1000
  vessel_types = tuple([int(vessel_type) for vessel_type in request.args.get('vessel-types').split(',')])
  origin = request.args.get('origin')
  destination = request.args.get('destination')
  query = """
    SELECT * FROM
      (SELECT * FROM segment_trip_value WHERE segment_number = %s) a -- this naming is just to not have an error
    JOIN
      (SELECT filtered_trip.trip_id, extract(epoch from filtered_trip.timestamp) * 1000 as timestamp_in_millis, filtered_trip_id_on_vessel_type.vessel_type FROM
        (SELECT filterd_origin_destination.trip_id, filtered_mmsi.vessel_type FROM
          (SELECT trip_id, mmsi
          FROM trip_info
          WHERE origin = %s and destination = %s) as filterd_origin_destination
        INNER JOIN
          (SELECT mmsi, vessel_type
          FROM vessel
          WHERE vessel_type IN %s) as filtered_mmsi
        ON filterd_origin_destination.mmsi = filtered_mmsi.mmsi) as filtered_trip_id_on_vessel_type
      INNER JOIN
        (SELECT * from
          (SELECT DISTINCT ON (trip_id) trip_id, timestamp FROM trip) as trip_start
        WHERE trip_start.timestamp >= to_timestamp(%s) at time zone 'utc' and trip_start.timestamp <= to_timestamp(%s) at time zone 'utc') as filtered_trip
      ON filtered_trip.trip_id = filtered_trip_id_on_vessel_type.trip_id) b
    USING(trip_id);
  """
  result = {}
  for i in range(1,11):
    params = (i, origin, destination, vessel_types, from_timestamp, to_timestamp,)
    cursor.execute(query, params)
    query_result = cursor.fetchall()
    result[i] = query_result

  return jsonify(result)

@app.route('/trips')
def trips():
  cursor = create_cursor()
  from_timestamp = request.args.get('from')
  to_timestamp = request.args.get('to')
  vessel_types = tuple([int(vessel_type) for vessel_type in request.args.get('vessel-types').split(',')])
  cursor.execute(""" SELECT mmsi FROM vessel WHERE vessel_type IN %s """, (vessel_types,))
  mmsi = cursor.fetchall()
  # cursor.execute(f""" SELECT trip_id FROM trip_info WHERE timestamp >= {from_timestamp} and timetamp <= {to_timestamp} """)
  return jsonify(mmsi)

# @app.route('')


# @app.route('/')
# def home():
#   return '<div>home</div>'
@app.route('/')
def index():
  return app.send_static_file('index.html')

@app.route('/trips-2')
def trips_2():
  cursor = create_cursor()
  vessel_types = tuple([int(vessel_type) for vessel_type in request.args.get('vessel-types').split(',')])
  origin = request.args.get('origin')
  destination = request.args.get('destination')
  query = """
    SELECT trip_id
    FROM trip_info
    WHERE origin = %s and destination = %s and mmsi IN
      (SELECT mmsi
      FROM vessel
      WHERE vessel_type IN %s);
  """
  params = (origin, destination, vessel_types)
  cursor.execute(query, params)
  result = cursor.fetchall()
  trip_id_list = [sublist[0] for sublist in result]

  return jsonify(trip_id_list)

def write_csv(matrix):
  with open('values.csv', 'w', newline='') as csvfile:
    spamwriter = csv.writer(csvfile, delimiter=',',
                            quotechar='|', quoting=csv.QUOTE_MINIMAL)
    spamwriter.writerow(['trip_id','min_sog',' avg_sog ','max_sog','distance_in_nm','duration_in_sec','start_heading','end_heading','max_heading_change'])
    for row in matrix:
      spamwriter.writerow(row)


def write_csv2(matrix):
  with open('total.csv', 'w', newline='') as csvfile:
    spamwriter = csv.writer(csvfile, delimiter=',',
                            quotechar='|', quoting=csv.QUOTE_MINIMAL)
    spamwriter.writerow(['trip_id','total_score',' seg_1 ','seg_2','seg_3','seg_4','seg_5','seg_6','seg_7','seg_8','seg_9','seg_10'])
    for row in matrix:
      spamwriter.writerow(row)

@app.route('/segments-values-2', methods = ['POST'])
def seg2():
  np.set_printoptions(suppress=True)
  data = tuple(request.get_json())
  cursor = create_cursor()
  query = """SELECT * FROM  segment_trip_value WHERE trip_id IN %s;"""
  # query = """SELECT * FROM  segment_trip_value WHERE trip_id IN (1, 3092, 3093);"""
  cursor.execute(query, (data,))
  segments = {}

  segments_median = {}
  segments_scores = {}
  for row in cursor:
    segment_number = row['segment_number']
    if not segments.get(segment_number):
      segments[segment_number] = {}
    segments[segment_number][row['trip_id']] = row

  for segment_number in segments:
    segment_values_complete = list(segments[segment_number].values())
    num_atr = len(segment_values_complete[0])
    segment_number_column, trip_id_column, segment_values = np.hsplit(np.asarray(segment_values_complete), [1,2])
    median = np.median(segment_values, axis=0)
    print(segment_values_complete)
    # segments_median[segment_number] = median
    median_diff = np.absolute(np.subtract(segment_values, median))
    max_values = np.max(median_diff, axis=0)
    final_scores = []
    num_rows = len(median_diff)
    num_columns = len(median_diff[0])
    for row_idx in range(num_rows):
      scores = []
      for column_idx in range(num_columns):
        val = median_diff[row_idx][column_idx]
        max_value = max_values[column_idx]
        if max_value == 0:
          score = 1
        else:
          score = np.around(1 - (val / max_values[column_idx]), 4)
        scores.append(score)
      final_scores.append(scores)
    final_scores_with_trip_id = np.hstack((trip_id_column, final_scores))
    segments_scores[segment_number] = final_scores_with_trip_id

  # temp
  is_first_run = True
  total_scores = None
  trip_ids_column = None
  for segment_scores in segments_scores.values():
    trip_id_column, scores = np.hsplit(np.asarray(segment_scores), [1])
    sum_scores = np.sum(scores, axis=1,keepdims = True)
    num_atr = len(scores[0])
    mean_scores = np.divide(sum_scores, num_atr)
    if is_first_run == True:
      is_first_run = False
      trip_ids_column = trip_id_column
      total_scores = mean_scores
    else:
      total_scores = np.append(total_scores, mean_scores, axis=1)

  total_trip_sum_score = np.sum(total_scores, axis=1,keepdims = True)
  num_segments = len(segments)
  total_trip_mean_score = np.divide(total_trip_sum_score, num_segments)
  total_scores = np.concatenate((trip_ids_column, total_trip_mean_score, total_scores), axis=1)
  # write_csv2(total_scores)
  write_csv(segments_scores[1])
  # create score by segment and total

    # write_csv(final_scores_with_trip_id)
    # break

    # print(max_values[2],max_values[3],max_values[4],max_values[5],max_values[6],max_values[7],max_values[8],max_values[9])

  return jsonify({})

@app.route('/segments-values-2-2', methods = ['POST'])
def seg2_2():
  np.set_printoptions(suppress=True)
  data = tuple(request.get_json())
  cursor = create_cursor()
  query = """SELECT * FROM  segment_trip_value WHERE trip_id IN %s;"""
  # query = """SELECT * FROM  segment_trip_value WHERE trip_id IN (1, 2033, 3093);"""
  cursor.execute(query, (data,))
  segments = {}

  segments_median = {}
  segments_scores = {}
  for row in cursor:
    segment_number = row['segment_number']
    if not segments.get(segment_number):
      segments[segment_number] = {}
    segments[segment_number][row['trip_id']] = row

  for segment_number in segments:
    segment_values_complete = list(segments[segment_number].values())
    num_atr = len(segment_values_complete[0])
    segment_number_column, trip_id_column, segment_values = np.hsplit(np.asarray(segment_values_complete), [1,2])
    filter_d = np.sum(segment_values, axis=1) > 0
    filtered_segments = segment_values[filter_d]
    median = np.median(filtered_segments, axis=0)
    median_diff = np.absolute(np.subtract(filtered_segments, median))
    max_values = np.max(median_diff, axis=0)
    final_scores = []
    num_rows = len(segment_values)
    num_columns = len(segment_values[0])
    row_idx = 0
    invalid_rows = 0
    for row_idx in range(num_rows):
      if filter_d[row_idx] == False:
        invalid_rows += 1
        final_scores.append([None]*num_columns)
        continue
      scores = []
      for column_idx in range(num_columns):
        val = median_diff[row_idx - invalid_rows][column_idx]
        max_value = max_values[column_idx]
        if max_value == 0:
          score = 1
        else:
          score = np.around(1 - (val / max_values[column_idx]), 4)
        scores.append(score)
      final_scores.append(scores)
    # print(len(final_scores))
    final_scores_with_trip_id = np.hstack((trip_id_column, final_scores))
    segments_scores[segment_number] = final_scores_with_trip_id.tolist()

  # temp
  # is_first_run = True
  # total_scores = None
  # trip_ids_column = None
  # for segment_scores in segments_scores.values():
  #   trip_id_column, scores = np.hsplit(np.asarray(segment_scores), [1])
  #   sum_scores = np.sum(scores, axis=1,keepdims = True)
  #   num_atr = len(scores[0])
  #   mean_scores = np.divide(sum_scores, num_atr)
  #   if is_first_run == True:
  #     is_first_run = False
  #     trip_ids_column = trip_id_column
  #     total_scores = mean_scores
  #   else:
  #     total_scores = np.append(total_scores, mean_scores, axis=1)

  # total_trip_sum_score = np.sum(total_scores, axis=1,keepdims = True)
  # num_segments = len(segments)
  # total_trip_mean_score = np.divide(total_trip_sum_score, num_segments)
  # total_scores = np.concatenate((trip_ids_column, total_trip_mean_score, total_scores), axis=1)

  # write_csv(segments_scores[10])
  return jsonify(segments_scores)

@app.route('/segments-values-z-score', methods = ['POST'])
def calc_z_score():
  np.set_printoptions(suppress=True)
  data = tuple(request.get_json())
  cursor = create_cursor()
  query = """SELECT * FROM  segment_trip_value WHERE trip_id IN %s;"""
  # query = """SELECT * FROM  segment_trip_value WHERE trip_id IN (1, 2033, 3093);"""
  cursor.execute(query, (data,))
  segments = {}
  segments_scores = {}

  for row in cursor:
    segment_number = row['segment_number']
    if not segments.get(segment_number):
      segments[segment_number] = {}
    segments[segment_number][row['trip_id']] = row

  for segment_number in segments:
    segment_values_complete = list(segments[segment_number].values())
    num_atr = len(segment_values_complete[0])
    segment_number_column, trip_id_column, segment_values = np.hsplit(np.asarray(segment_values_complete), [1,2])

    filter_d = np.sum(segment_values, axis=1) > 0 # filter trips which does not have data in this segment
    filtered_segments = segment_values[filter_d]

    z_scores = stats.zscore(filtered_segments, axis=0, ddof=1) # calculate on columns use n-1 degress of freedom

    final_scores = []
    num_rows = len(segment_values)
    num_columns = len(segment_values[0])
    row_idx = 0
    invalid_rows = 0
    for row_idx in range(num_rows):
      if filter_d[row_idx] == False:
        invalid_rows += 1
        final_scores.append([None]*num_columns)
        continue
      else:
        final_scores.append(z_scores[row_idx - invalid_rows])

    # print(len(final_scores))
    final_scores_with_trip_id = np.hstack((trip_id_column, final_scores))
    segments_scores[segment_number] = final_scores_with_trip_id.tolist()

  return jsonify(segments_scores)

@app.route('/test', methods = ['POST'])
def test():
  data = tuple(request.get_json())
  cursor = create_dict_cursor()
  averages = []
  query = """
    SELECT avg(ST_X(lng_lat::geometry)) as lon, avg(ST_Y(lng_lat::geometry)) as lat FROM trip where trip_id IN %s and ST_Intersects(trip.lng_lat, (SELECT rect from segment where segment_number = %s));
  """
  for i in range(1, 11):
    params = (data, i)
    cursor.execute(query, params)
    result = cursor.fetchall()
    averages.append(result)

  return jsonify(averages)


@app.route('/test-2', methods = ['POST'])
def test_2():
  data = tuple(request.get_json())
  cursor = create_dict_cursor()
  averages = [data[1]]
  query = """
    SELECT avg(ST_X(lng_lat::geometry)) as lng, avg(ST_Y(lng_lat::geometry)) as lat FROM trip where trip_id = %s and ST_Intersects(trip.lng_lat, (SELECT rect from segment where segment_number = %s));
  """
  for i in range(1, 11):
    sum_lng = 0
    sum_lat = 0
    num_trips = len(data)
    for trip_id in data:
      params = (trip_id, i)
      cursor.execute(query, params)
      result = cursor.fetchone()
      lng = result.get('lng')
      lat = result.get('lat')
      if lng:
        sum_lng += lng
        sum_lat += lat
      else:
        num_trips -= 1
    averages.append((sum_lat/num_trips, sum_lng/num_trips))

  return jsonify(averages)

@app.route('/test-3')
def test_3():
  cursor = create_cursor()
  query = """
    select ST_AsText(lng_lat) from trip where trip_id = 9;
  """

  cursor.execute(query)
  result = cursor.fetchall()

  return jsonify(result)

@app.route('/trajectory/<int:tripId>')
def trajectory(tripId):
  cursor = create_dict_cursor()
  query = """ SELECT ST_Y(lng_lat::geometry) as lat, ST_X(lng_lat::geometry) as lng from trip where trip_id = %s """
  cursor.execute(query, (tripId,))

  return jsonify(cursor.fetchall())

@app.route('/trajectory2/<int:tripId>')
def trajectory2(tripId):
  trajectory = load_trip_trajectory(tripId)
  return jsonify(trajectory)

bla = [9,14,20,75,92,101,137,158,159,163,170,189,293,294,325,339,393,515,778,779,780,788,791,794,796,797,798,801,802,803,821,828,950,1029,1033,1040,1054,1058,1065,1066,1092,1093,1103,1105,1107,1146,1178,1180,1181,1397,1440,1446,1455,1470,1477,1515,1531,1561,1563,1643,1659,1665,1690,1696,1905,1927,1936,2033,2034,2048,2099,2100,2111,2138,2159,2162,2188,2191,2201,2215,2398,2466,2469,2505,2714,2781,2793,2794,2796,2828,2829,2835,2864,3048,3050,3070,3072,3151,3241,3247,3255,3267]

@app.route('/csv',  methods = ['POST'])
def csva():
  data = tuple(request.get_json())
  # valid = filter(data)

  query = """
    SELECT trip_id, ST_Y(lng_lat::geometry) as lat, ST_X(lng_lat::geometry) as lng, travel_distance_in_nm from trip where trip_id IN %s;
  """
  cursor = create_cursor()
  cursor.execute(query, (data,))

  with open('trajectories_6.csv', 'w', newline='') as csvfile:
    spamwriter = csv.writer(csvfile, delimiter=',',
                            quotechar='|', quoting=csv.QUOTE_MINIMAL)
    spamwriter.writerow(['trip_id', 'lat', 'lng', 'travel_distance_in_nm'])
    for row in cursor:
      spamwriter.writerow(row)

def filter(data):
  np.set_printoptions(suppress=True)
  cursor = create_cursor()
  query = """SELECT * FROM  segment_trip_value WHERE trip_id IN %s;"""
  cursor.execute(query, (data,))
  valid = list(data)

  for row in cursor:
    trip_id = row['trip_id']
    if row['max_sog'] == 0 or trip_id not in bla:
      try:
        valid.remove(trip_id)
      except:
        continue

  return tuple(valid)

@app.route('/mean-trajectory')
def get_mean_route():
  mean_route = mean_route_mock.get_route()
  return jsonify(mean_route)

# @app.route('/segment-attributes')
# cursor = create_cursor()
# query = """SELECT * FROM  segment_trip_value WHERE trip_id IN %s;"""


# @app.route('/mean-traj-2')
# def get_mean_traj_2():

@app.route('/trip-v2/<int:tripId>')
def get_trip_v2(tripId):
  trip = load_trip(tripId)
  return jsonify(trip)

"""
FOR s IN segment

"""

"""
SELECT avg(ST_X(lng_lat::geometry)) as lon, avg(ST_Y(lng_lat::geometry)) as lat FROM trip where ST_Intersects(trip.lng_lat, (SELECT rect from segment where segment_number = %s));
"""

"""
SELECT avg(ST_X(lng_lat::geometry)) as lon, avg(ST_Y(lng_lat::geometry)) as lat FROM trip where ST_Intersects(trip.lng_lat, (SELECT rect from segment where segment_number = ));
"""
