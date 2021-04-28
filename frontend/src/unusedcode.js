// Gambiarra pra fazer overlay no mapa com texto

{/* <MarkerWithLabel

  position={segmentHover ? segmentHover.pos : center}
  labelAnchor={segmentHover ? segmentHover.pos : center}
  labelStyle={{backgroundColor: "white", fontSize: "32px", padding: "16px", transform: "translate(-50%, -100%)"}}
>
  <div>Hello There!</div>
</MarkerWithLabel> */}


// const [pos, setPos] = useState(null);
  // console.log(pos)
  // const onClick = (segmentNumber) => {
  //   if (!clickable) {
  //     return;
  //   }

  //   const selectedUpdated = [...selected];
  //   const segmentNumberIndex = selectedUpdated.indexOf(segmentNumber);
  //   if (segmentNumberIndex >= 0) {
  //     selectedUpdated.splice(segmentNumberIndex, 1);
  //   } else {
  //     selectedUpdated.push(segmentNumber);
  //   }

  //   onSelectedChange(selectedUpdated);
  // }

  // const polygon = (segment) => {
  //   const segmentNumber = segment.segment_number;
  //   const isSelected = selected.indexOf(segmentNumber) >= 0;
  //   const color = isSelected ? '#ff0' : "#000";

  //   return (
  //     <Polygon
  //       key={segment.segment_number}
  //       path={segment.coordinates}
  //       onMouseOver={(e) => console.log(e.latLng)}
  //       // editable={true}
  //       clickable={clickable}
  //       onClick={()=> onClick(segment.segment_number)}
  //       // draggable={true}
  //       options={{
  //         fillColor: color,
  //         fillOpacity: 0.4,
  //         strokeColor: "#000",
  //         strokeOpacity: 1,
  //         strokeWeight: 1
  //       }}
  //     />
  //   );
  // }



  {/* <DrawingManager
        defaultDrawingMode={google.maps.drawing.OverlayType.RECTANGLE}
        onRectangleComplete={rec => {console.log(rec)}}
        drawingMode={null}
        defaultOptions={{
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
              google.maps.drawing.OverlayType.CIRCLE,
              google.maps.drawing.OverlayType.POLYGON,
              google.maps.drawing.OverlayType.RECTANGLE,
            ],
          },
          rectangleOptions: {
            editable:true,
            draggable: true,
            clickable: true,
          },
          circleOptions: {
            fillColor: `#ffff00`,
            fillOpacity: 1,
            strokeWeight: 5,
            clickable: true,
            draggable: true,
            editable: true,
            zIndex: 1,
          },
        }}
      /> */}
      {/* {props.segments.map(segment => (
        <Polygon

        ></Polygon>
      ))} */}
