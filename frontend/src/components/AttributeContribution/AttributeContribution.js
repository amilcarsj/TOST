import React, { useState, useEffect} from 'react';
import { Checkbox } from 'antd';
import './AttributeContribution.css';
import * as d3 from 'd3';


export const AttributeContribution = ({selectedTrip,meanTrajectory}) => {
  const [trip, setTrip] = useState(null);
  
  //This hook will be called when this component loads for the first time, 
  // will calculate the attribution score for the meanTrajectory 
  useEffect(() => {
    
  }, [])
  // This hook will be called when a new trip is selected on the scoretable
  useEffect(() => {
    console.log(selectedTrip);
    setTrip(selectedTrip);
  }, [selectedTrip])

  return (
    <div>
      <div>
          Work Going on!
          <svg>
          </svg>
      </div>
      
    </div>
  );

}

