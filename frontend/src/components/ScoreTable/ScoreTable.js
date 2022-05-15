import React, { useRef, useState, useEffect } from 'react';
import { TableLens } from '../TableLens';
import { calculate } from './calculateScores';
import { filterData } from './filterComputedData';
import moize from 'moize';

const TableLensCachedComponent = React.memo(TableLens);

const header = ['trip_id', 'Highest Score', 'SR_1', 'SR_2','SR_3','SR_4', 'SR_5', 'SR_6','SR_7','SR_8', 'SR_9', 'SR_10'];

// We memoize so we don't create a new data without need, which would also erase filters on the header
const memCalculate = moize(calculate);
const memFilter = moize(filterData);
export const ScoreTable = ({ tripsId, onScoreChange, data, selectedSegments, selectedAttr, onTripClick, scenario }) => {
  const [calcMethod, setCalcMethod] = useState('max');
  header[1] = calcMethod == 'max' ? 'Highest Score' : 'Avg Score';
  // const aData = [...data.slice(0, 200)];
  const computedData = memCalculate(tripsId, data, selectedSegments, selectedAttr, calcMethod);
  // const filteredDataByScenario = memFilter(computedData, scenario);
  const filteredHeader = header.filter((val, index) => {
    return index == 0 || index == 1 || selectedSegments.includes(index - 1)
  })
  useEffect(() => {
    onScoreChange(computedData); 
  }, [computedData]);

  return (
    <>
      { selectedSegments.length > 0 && selectedAttr.length > 0 ?
        <TableLensCachedComponent data={computedData} header={filteredHeader} onTripClick={onTripClick} calcMethod={calcMethod} setCalcMethod={setCalcMethod}/> :
        <div className='placeholder'>Select at least one segment and one attribute </div>
      }
    </>
  )
}
