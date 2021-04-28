CREATE TABLE IF NOT EXISTS segment_trip_value (
  segment_number        smallint NOT NULL,
  trip_id               integer NOT NULL,
  min_sog               real NOT NULL,
  avg_sog               real NOT NULL,
  max_sog               real NOT NULL,
  distance_in_nm        real NOT NULL,
  duration_in_sec       integer NOT NULL,
  start_heading         smallint NOT NULL,
  end_heading           smallint NOT NULL,
  max_heading_change    smallint NOT NULL,
  PRIMARY KEY (segment_number, trip_id),
  FOREIGN KEY (trip_id) REFERENCES trip_info (trip_id) ON DELETE CASCADE
);
