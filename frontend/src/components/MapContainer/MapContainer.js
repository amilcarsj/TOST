import React, { useState, useEffect } from 'react';
import { MapWrapper } from '../Map';

export const MapContainer = (props) => {

  // This is an aproximate way to get the center of the map in case all segments are equally divided
  const getCenter = () => {
    const segments = props.segments;
    if (segments.length == 0) {
      return null;
    }
    const middleSegment = Math.round(segments.length/2);
    const coordinates = segments[middleSegment].coordinates;
    const center = { 'lat': (coordinates[0].lat + coordinates[2].lat) / 2, 'lng': (coordinates[0].lng + coordinates[2].lng) /2 };
    return center;
  }

  return (<MapWrapper  center={getCenter()} {...props} />)
}
