/*global d3*/
/*global navio*/
import React, { useState, useRef, useEffect } from 'react';
import navio from '../blaa';

export const NavioTest = ({ data, selectedAttr, attrWidth, navioHeight }) => {
  // const [nn, setNN] = useState(null);

  const divElem = useRef(null);
  useEffect(() => {
    remove()
    const nv = navio(d3.select(divElem.current), navioHeight);
    nv.data(data);
    // nv.data(data);
    nv.attribWidth = 50;
    nv.nullColor = "black";
    nv.defaultColorInterpolator = d3.interpolateReds;
    nv.id("tripId");
    nv.addAllAttribs(selectedAttr);
  });

  const remove = () => {
    document.querySelectorAll('._nv_popover').forEach(elem => elem.remove());

    const myNode = document.getElementById("scoring");
    while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
    }
  }

  return (
    <div
      style={{ width: '100%', overflowX: 'scroll', minHeight: '700px' }}
      id='scoring'
      ref={divElem}
    />
  )
}

