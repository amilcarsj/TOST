CREATE TABLE IF NOT EXISTS trip_raw (
  trip_id    integer NOT NULL,
  timestamp  timestamp,
  mmsi       integer,
  lng_lat    geography(POINT, 4326),
  heading    smallint,
  sog        real,
  rot        real,
  cog        real,
  ship_type  smallint,
  PRIMARY KEY (trip_id, timestamp)
);
