SELECT * FROM
  (SELECT * FROM segment_trip_value) a -- this naming is just to not have an error
JOIN
  (SELECT filtered_trip.trip_id, filtered_trip.timestamp, filtered_trip_id_on_vessel_type.vessel_type FROM -- this select is to join and have access to vessel type,
    (SELECT filterd_origin_destination.trip_id, filtered_mmsi.vessel_type FROM -- this query find trip_id based on the mmsi filtered bellow, we inner join with filtered mmsi so we have the vessel type as well
      (SELECT trip_id, mmsi
      FROM trip_info
      WHERE origin = 'HOUSTON') as filterd_origin_destination
    INNER JOIN
      (SELECT mmsi, vessel_type -- this query find all vessels (mmsi) given a list of vessel types
      FROM vessel
      WHERE vessel_type IN (31) limit 10) as filtered_mmsi
    ON filterd_origin_destination.mmsi = filtered_mmsi.mmsi) as filtered_trip_id_on_vessel_type
  INNER JOIN
    (SELECT * from -- this query will filter trips based on selected date
      (SELECT DISTINCT ON (trip_id) trip_id, timestamp FROM trip) as trip_start -- this selects the first row of each trip so we have access to the first timestamp
    WHERE trip_start.timestamp > '2012-05-01 00:26:27') as filtered_trip
  ON filtered_trip.trip_id = filtered_trip_id_on_vessel_type.trip_id) b
USING(trip_id);


SELECT * FROM
  (SELECT * FROM segment_trip_value) a -- this naming is just to not have an error
JOIN
  (SELECT filtered_trip.trip_id, filtered_trip.timestamp, filtered_trip_id_on_vessel_type.vessel_type FROM -- this select is to join and have access to vessel type,
    (SELECT filterd_origin_destination.trip_id, filtered_mmsi.vessel_type FROM -- this query find trip_id based on the mmsi filtered bellow, we inner join with filtered mmsi so we have the vessel type as well
      (SELECT trip_id, mmsi
      FROM trip_info
      WHERE origin = %s and destination = %s) as filterd_origin_destination
    INNER JOIN
      (SELECT mmsi, vessel_type -- this query find all vessels (mmsi) given a list of vessel types
      FROM vessel
      WHERE vessel_type IN %s) as filtered_mmsi
    ON filterd_origin_destination.mmsi = filtered_mmsi.mmsi) as filtered_trip_id_on_vessel_type
  INNER JOIN
    (SELECT * from -- this query will filter trips based on selected date
      (SELECT DISTINCT ON (trip_id) trip_id, timestamp FROM trip) as trip_start -- this selects the first row of each trip so we have access to the first timestamp
    WHERE trip_start.timestamp >= %s and trip_start.timestamp <= %s) as filtered_trip
  ON filtered_trip.trip_id = filtered_trip_id_on_vessel_type.trip_id) b
USING(trip_id);


  query = """
    SELECT * FROM
      (SELECT * FROM segment_trip_value) a -- this naming is just to not have an error
    JOIN
      (SELECT filtered_trip.trip_id, filtered_trip.timestamp, filtered_trip_id_on_vessel_type.vessel_type FROM -- this select is to join and have access to vessel type,
        (SELECT filterd_origin_destination.trip_id, filtered_mmsi.vessel_type FROM -- this query find trip_id based on the mmsi filtered bellow, we inner join with filtered mmsi so we have the vessel type as well
          (SELECT trip_id, mmsi
          FROM trip_info
          WHERE origin = %s and destination = %s) as filterd_origin_destination
        INNER JOIN
          (SELECT mmsi, vessel_type -- this query find all vessels (mmsi) given a list of vessel types
          FROM vessel
          WHERE vessel_type IN %s) as filtered_mmsi
        ON filterd_origin_destination.mmsi = filtered_mmsi.mmsi) as filtered_trip_id_on_vessel_type
      INNER JOIN
        (SELECT * from -- this query will filter trips based on selected date
          (SELECT DISTINCT ON (trip_id) trip_id, timestamp FROM trip) as trip_start -- this selects the first row of each trip so we have access to the first timestamp
        WHERE trip_start.timestamp >= to_timestamp(%s) at time zone 'utc' and trip_start.timestamp <= to_timestamp(%s) at time zone 'utc') as filtered_trip
      ON filtered_trip.trip_id = filtered_trip_id_on_vessel_type.trip_id) b
    USING(trip_id);
  """



SELECT
    g.column_name,
    g.data_type,
    g.character_maximum_length,
    g.udt_name,
    f.type,
    f.srid
FROM
     information_schema.columns as g JOIN
     geometry_columns AS f
         ON (g.table_schema = f.f_table_schema and g.table_name = f.f_table_name )
WHERE
    table_schema = 'public' and
    table_name = 'segment'


SELECT type
FROM geography_columns
WHERE f_table_schema = 'public'
AND f_table_name = 'segment'
and f_geography_column = 'rect';
