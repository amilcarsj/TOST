from math import cos, sin, atan2, degrees, radians

def calculate_initial_compass_bearing(pointA, pointB):
    """
    Formula - Forward azimuth -
    Calculates the bearing between two points.
    The formulae used is the following:
        θ = atan2(sin(Δlong).cos(lat2),
                  cos(lat1).sin(lat2) − sin(lat1).cos(lat2).cos(Δlong))
    :Parameters:
      - `pointA: The tuple representing the latitude/longitude for the
        first point. Latitude and longitude must be in decimal degrees
      - `pointB: The tuple representing the latitude/longitude for the
        second point. Latitude and longitude must be in decimal degrees
    :Returns:
      The bearing in degrees
    :Returns Type:
      float
    """
    if (type(pointA) != tuple) or (type(pointB) != tuple):
        raise TypeError("Only tuples are supported as arguments")

    lat1 = radians(pointA[0])
    lat2 = radians(pointB[0])

    diffLong = radians(pointB[1] - pointA[1])

    x = sin(diffLong) * cos(lat2)
    y = cos(lat1) * sin(lat2) - (sin(lat1)
            * cos(lat2) * cos(diffLong))

    initial_bearing = atan2(x, y)

    # Now we have the initial bearing but math.atan2 return values
    # from -180° to + 180° which is not what we want for a compass bearing
    # The solution is to normalize the initial bearing as shown below
    initial_bearing = degrees(initial_bearing)
    compass_bearing = (initial_bearing + 360) % 360

    return compass_bearing

def calculate_mean_bearing(bearings):
  '''
  Given a list of bearing in degress, it calculates the mean.
  Based on: http://abelian.org/vlf/bearings.html and https://rosettacode.org/wiki/Averages/Mean_angle
  '''
  sum_sin = 0
  sum_cos = 0
  for val in bearings:
      val = radians(val)
      sum_sin += sin(val)
      sum_cos += cos(val)

  mean = atan2(sum_sin, sum_cos)
  mean = (degrees(mean) + 360) % 360
  return mean
