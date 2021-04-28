import React, { useState, useEffect, memo } from 'react';
import { NavioTest } from '../NavioTest';
import { Slider } from 'antd';
import './ScoreContainer.css';

/**
 *
* @param {number[]} tripsId - list of trip ids.
* @param {Object.<number, number[][]>} data - the key is segment number and the value is a matrix where each row is a trip and each column is an attribute value
* @param {number[]} selectedSegments - list of segment_number.
* @param {number[]} selectedAttr - list of selected attributes which is given by the original attr list order.
 *
 */
const ScoreContainer = ({ tripsId, data, selectedSegments, selectedAttr }) => {
  const [attrWidth, setAttrWidth] = useState(15);
  const [navioHeight, setNavioHeight] = useState(600);
  /**
   * For each trip id => look at each segment, sum the score of each attribute and divide by the number of attributes. Then,
   * computer the total trip score by summing the score on each segment divided by the number of segments
   */
  const calculate = () => {
    const segmentNumbers = Object.keys(data);
    const numSegments = selectedSegments.length;
    const numAttr = selectedAttr.length;
    const tripsScoring = tripsId.map(tripId => {
      let totalTripScore = 0;
      let numSegmentsWithScore = numSegments; // use this while there can be trips without score in certain segments
      const segmentScoresForTrip = selectedSegments.reduce((segmentScores, segmentNumber) => {
        const tripIdAndValues = data[segmentNumber].find(row => row[0] == tripId);

        const hasValuesInSegment = tripIdAndValues[1] != null; // if any attribute is null then all of then will be null, except for the tripId

        if (!hasValuesInSegment) {
          numSegmentsWithScore -= 1;
          segmentScores[`SR_${segmentNumber}`] = null;
          return segmentScores;
        }

        const filteredAttr = selectedAttr.map(attrIndex => tripIdAndValues[attrIndex + 1]) // we add +1 because the first value is the trip id

        const sum = filteredAttr.reduce((acc, cur) => acc + Math.abs(cur), 0);
        const score = sum / numAttr;
        totalTripScore += score;
        segmentScores[`SR_${segmentNumber}`] = score;

        return segmentScores;
      }, {});

      totalTripScore = numSegmentsWithScore > 0 ? totalTripScore / numSegmentsWithScore : null;
      const result = { 'tripId': tripId, 'totalScore': totalTripScore, ...segmentScoresForTrip };
      return result;
    });

    // downloadObjectAsJson(tripsScoring, 'scoring');
    return tripsScoring;
  }

  const downloadObjectAsJson = (tripScoring, exportName) => {
    const scoresGroup = tripScoring.filter(tripScore => {
      return !Object.values(tripScore).includes(null);
    }).map(tripScore => {
      const scoreGroup = {};

      Object.keys(tripScore).forEach(key => {
        if (key == 'tripId') {
          return;
        }
        const score = tripScore[key];
        if (score == null) {

        }
        else if (score <= 1) {
          scoreGroup[key] = '<=1';
        }
        else if (score <= 2) {
          scoreGroup[key] = '>1 and <=2';
        }
        else if (score <= 3){
          scoreGroup[key] = '>2 and <=3';
        }
        else {
          scoreGroup[key] = '>3';
        }
      })

      return scoreGroup;
    })

    // console.log(scoresGroup)
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scoresGroup));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  const getSelectedAttr = () => {
    const selectedAttr = ['totalScore'];
    selectedSegments.forEach(segmentNumber => selectedAttr.push(`SR_${segmentNumber}`))
    return selectedAttr;
  }

  return (
    <>
      <div className='Sliders'>
        <div className='SliderContainer'>
          <div>Column width</div>
          <Slider defaultValue={attrWidth} min={10} max={50} onAfterChange={setAttrWidth}/>
        </div>
        <div className='SliderContainer'>
          <div>Table height</div>
          <Slider defaultValue={navioHeight} min={400} max={800} onAfterChange={setNavioHeight}/>
        </div>
      </div>
      <NavioTest data={calculate()} selectedAttr={getSelectedAttr()} attrWidth={attrWidth} navioHeight={navioHeight}/>
    </>
  )
}

const PureScoreContainer = memo(ScoreContainer); // This makes so the component doesn't re render when the props are the same so it doesn't lose the filters
export { PureScoreContainer as ScoreContainer };
