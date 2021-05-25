/*global google*/
import React, { Component,  useState, useEffect } from 'react';
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Polyline, InfoWindow, Polygon, Rectangle, Circle, OverlayView } from "react-google-maps";
import { compose, withProps, withStateHandlers, withState } from "recompose";
import { DrawingManager } from "react-google-maps/lib/components/drawing/DrawingManager";
import { MarkerWithLabel } from "react-google-maps/lib/components/addons/MarkerWithLabel";
import { CustomMapControl}  from './CustomMapControl';
import { Divider } from 'antd';

import './Map.css';

const mapOptions = {
  fullscreenControl: true,
  streetViewControl: false,
  mapTypeControl: false,
};

// googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyDjwPmBxYvzXZfD6M_Xs5sUWVgF7F9zTro",
export const Map = compose(
  withProps({
    googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyAbkgNLjOHPO2iKcK5iL2Bc1VLwgJZ4IXI",
    loadingElement: <div style={{ height: `40vh`, width: `100%` }} />,
    containerElement: <div className='MapWrapper' />,
    mapElement: <div style={{ height: `100%` }} />,
  }),
  withGoogleMap
)(({ center, children }) => {
  return (
    <GoogleMap
      defaultZoom={6}
      defaultCenter={center}
      center={center}
      options={mapOptions}
    >
      {children}
    </GoogleMap>
  )
});

export const MapWrapper = ({ segments, center, selected, clickable, onSelectedChange, selectedTrip, meanTrajectory, selectTripComponent }) => {
  const [segmentHover, setSegmentHover] = useState(null);
  const onClick = (segmentNumber) => {
    if (!clickable) {
      return;
    }

    const selectedUpdated = [...selected];
    const segmentNumberIndex = selectedUpdated.indexOf(segmentNumber);
    if (segmentNumberIndex >= 0) {
      selectedUpdated.splice(segmentNumberIndex, 1);
    } else {
      selectedUpdated.push(segmentNumber);
      selectedUpdated.sort((a, b) => a-b);
    }

    onSelectedChange(selectedUpdated);
  }

  /**
   * There is a bug with this component if we remove it, so instead we just hide its contents. Possible solutions:
   * update/change lib: https://github.com/JustFly1984/react-google-maps-api
   * Try to do a crazy fix: https://lifesaver.codes/answer/uncaught-typeerror-cannot-read-property-overlaymousetarget-of-null
   */
  const renderSegmentLabel = () => (
    <OverlayView
      key={1}
      position={ segmentHover ? segmentHover.pos : center}
      getPixelPositionOffset={() => ({ y: -5 })}
      mapPaneName={OverlayView.FLOAT_PANE}
    >
      {segmentHover ?
        (<div className='SegmentLabel'>
          SR_{segmentHover.segmentNumber}
        </div>) :
        (<div></div>)
      }

    </OverlayView>
  );

  const renderMeanTrajectory = () => (
    <Polyline
      path={meanTrajectory}
      geodesic={true}
      options={{
        strokeColor: 'green',
        strokeOpacity: 0.40,
        strokeWeight: 3,
      }}
    />
  );

  // const renderTrajectory = () => (
  //   <Polyline
  //     path={selectedTrip.trajectory}
  //     geodesic={true}
  //     options={{
  //       strokeColor: 'black',
  //       strokeOpacity: 0.75,
  //       strokeWeight: 2,
  //     }}
  //   />
  // );

  const renderTrajectory2 = (path, interpolated, index) => (
    <Polyline
      key={index}
      path={path}
      geodesic={true}
      options={{
        strokeColor: interpolated ? 'red' : 'black',
        strokeOpacity: 0.75,
        strokeWeight: 2,
      }}
    />
  );

  const renderTrajectory = () => {
    const polylines = [];
    let curPath = [];
    let interpolated = false;
    selectedTrip.trajectory.forEach((row, index) => {
      if (row.interpolated == interpolated) {
        curPath.push(row);
      } else {
        polylines.push(renderTrajectory2(curPath, interpolated, index));
        interpolated = !interpolated;
        curPath = [row]
      }
    });
    polylines.push(renderTrajectory2(curPath, interpolated, -1));
    return polylines;
  }

  const renderLegend = () => (
    <CustomMapControl controlPosition={ google.maps.ControlPosition.LEFT_BOTTOM}>
      <div className='TrajectoryLegendContainer'>
        <div className='Legend'>Legend</div>
        <Divider className='Divider' />
        <div className='LegendTitle'>Spatial region</div>
        <div className='LegendItem'><div className='SelectedSegmentLegend'></div> Selected </div>
        <div className='LegendItem'><div className='NotSelectedSegmentLegend'></div> Not selected </div>
        <div className='LegendTitle'> Trajectories</div>
        <div className='LegendItem'><div className='MeanTrajectoryLegend'></div> Mean trajectory</div>
        <div className='LegendItem'><div className='ATrajectoryLegend'></div> Selected trip trajectory </div>
        <div className='LegendItem'><div className='InterpolationLegend'></div> Selected trip interpolation </div>
      </div>
    </CustomMapControl>
  );

  const polygon = (segment) => {
    const segmentNumber = segment.segment_number;
    const isSelected = selected.indexOf(segmentNumber) >= 0;
    const color = isSelected ? '#ff0' : "#000";
    const opacity = isSelected ? 0.3 : 0

    return (
      <Polygon
        key={segmentNumber}
        path={segment.coordinates}
        onMouseMove={(e) => setSegmentHover({ pos: e.latLng, segmentNumber: segmentNumber })}
        onMouseOut={() => setSegmentHover(null)}
        // editable={true}
        clickable={clickable}
        onClick={()=> onClick(segmentNumber)}
        // draggable={true}
        options={{
          fillColor: color,
          fillOpacity: opacity,
          strokeColor: "#000",
          strokeOpacity: 1,
          strokeWeight: 1
        }}
      />
    );
  }
  return (
    <Map center={center}>
      {segments.map(segment => (
        polygon(segment)
      ))}

      {selectedTrip && renderTrajectory()}
      {meanTrajectory && renderMeanTrajectory()}

      {renderSegmentLabel()}
      {renderLegend()}

      <CustomMapControl controlPosition={google.maps.ControlPosition.LEFT_TOP}>
        {selectTripComponent}
      </CustomMapControl>

    </Map>
  )
}
