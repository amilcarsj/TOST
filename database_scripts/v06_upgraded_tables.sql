CREATE TABLE IF NOT EXISTS trip_v2 (
  trip_id                 integer NOT NULL,
  timestamp               timestamp(3) without time zone default (now() at time zone 'utc') NOT NULL,
  lng_lat                 geography(POINT, 4326) NOT NULL,
  bearing_in_deg          smallint,
  speed_in_knots          real,
  travel_distance_in_nm   real,
  interpolated            boolean NOT NULL,
  PRIMARY KEY (trip_id, timestamp),
  FOREIGN KEY (trip_id) REFERENCES trip_info (trip_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS segment_v2 (
  segmentation_id   integer NOT NULL,
  segment_number    smallint NOT NULL,
  polygon           geography(POLYGON, 4326) NOT NULL,
  name              text,
  PRIMARY KEY (segmentation_id, segment_number)
);

CREATE TABLE IF NOT EXISTS segment_trip_value_v2 (
  segmentation_id          integer NOT NULL,
  segment_number           smallint NOT NULL,
  trip_id                  integer NOT NULL,
  min_speed_in_knots       real,
  avg_speed_in_knots       real,
  max_speed_in_knots       real,
  avg_bearing_in_deg       smallint,
  distance_in_nm           real,
  duration_in_sec          integer,
  interpolation_percentage real,
  PRIMARY KEY (segmentation_id, segment_number, trip_id)
  FOREIGN KEY (trip_id) REFERENCES trip_info (trip_id) ON DELETE CASCADE
);
