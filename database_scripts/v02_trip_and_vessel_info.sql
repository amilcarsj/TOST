CREATE TABLE IF NOT EXISTS vessel (
  mmsi          integer NOT NULL,
  vessel_type   smallint,
  PRIMARY KEY (mmsi)
);

CREATE TABLE IF NOT EXISTS trip_info (
  trip_id       integer NOT NULL,
  mmsi          integer NOT NULL,
  eta           timestamp NOT NULL,
  origin        text NOT NULL,
  destination   text NOT NULL,
  PRIMARY KEY (trip_id),
  FOREIGN KEY (mmsi) REFERENCES vessel (mmsi) ON DELETE CASCADE
);
