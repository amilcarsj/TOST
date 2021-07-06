import React, { useState, useEffect} from 'react';
import { Checkbox } from 'antd';
import './AttributeContribution.css';

const CheckboxGroup = Checkbox.Group;

export const AttributeContribution = ({selectedTrip,meanTrajectory}) => {
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    console.log(selectedTrip);
  }, [selectedTrip])

  return (
    <div>
      <div>
          Work Going on!
      </div>
      
    </div>
  );

}

