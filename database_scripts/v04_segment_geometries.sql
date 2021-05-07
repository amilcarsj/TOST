CREATE TABLE IF NOT EXISTS segment (
  segment_number    smallint NOT NULL,
  rect              geometry(POLYGON, 4326),
  PRIMARY KEY (segment_number)
);


ALTER TABLE segment
  ALTER COLUMN rect TYPE geometry(POLYGON, 4326)
    USING ST_SetSRID(rect,4326);

