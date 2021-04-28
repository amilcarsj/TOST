CREATE TABLE IF NOT EXISTS trip (
  trip_id                 integer NOT NULL,
  timestamp               timestamp NOT NULL,
  lng_lat                 geography(POINT, 4326) NOT NULL,
  heading                 smallint NOT NULL,
  sog                     real NOT NULL,
  rot                     real NOT NULL,
  cog                     real NOT NULL,
  travel_distance_in_nm   real NOT NULL,
  PRIMARY KEY (trip_id, timestamp),
  FOREIGN KEY (trip_id) REFERENCES trip_info (trip_id) ON DELETE CASCADE
);
