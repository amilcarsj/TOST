from flask import jsonify
from server import app, request
import numpy as np
import json
from scipy import stats
from db.queries.segments import load_segment_values_for_trips, load_segments_as_geojson, load_segments

@app.route('/segments-values-z-score-2', methods = ['POST'])
def calc_z_score2():
  np.set_printoptions(suppress=True)
  data = request.get_json()
  trip_ids = tuple(data['trip_ids'])
  segmentation_id = data['segmentation_id']
  rows = load_segment_values_for_trips(segmentation_id, trip_ids)

  segments = {}
  segments_scores = {}
  for row in rows:
    segment_number = row['segment_number']
    if not segments.get(segment_number):
      segments[segment_number] = {}
    segments[segment_number][row['trip_id']] = row[1:] # removes segmentation id

  for segment_number in segments:
    segment_values_complete = list(segments[segment_number].values())
    num_atr = len(segment_values_complete[0])
    interpolation_index = num_atr - 1
    segment_number_column, trip_id_column, segment_values, interpolation_percentage = np.hsplit(np.asarray(segment_values_complete), [1,2, interpolation_index])
    filter_d = [row[0] is not None for row in segment_values] # filter trips which does not have data in this segment,
    # filter_d = np.sum(segment_values, axis=1) > 0

    filtered_segments = np.array(segment_values[filter_d], dtype=np.float64)

    z_scores = stats.zscore(filtered_segments, axis=0, ddof=1) # calculate on columns use n-1 degress of freedom
    z_scores = np.nan_to_num(z_scores) # if std is 0 the values will become nan, this convert is it to 0

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
    final_scores_with_trip_id = np.hstack((trip_id_column, final_scores, interpolation_percentage))
    segments_scores[segment_number] = final_scores_with_trip_id.tolist()

  return jsonify(segments_scores)

@app.route('/segments2')
def segments2():
  segments = load_segments_as_geojson(1) # this is temporary

  def format_segment(segment):
    coordinates = json.loads(segment['geojson'])['coordinates'][0] # the coordinates comes inside an extra array and the geojson is a string
    lat_lng_coordinates = list(map(lambda coord : { 'lat': coord[1], 'lng': coord[0] }, coordinates))
    return { 'segment_number': segment['segment_number'], 'coordinates': lat_lng_coordinates }

  formated_segments = list(map(format_segment, segments))
  return jsonify(formated_segments)

from db.db_connection import create_dict_cursor
from db.queries.segments import load_trips_data_on_polygon

