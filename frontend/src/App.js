import React, { useState, useEffect } from 'react';
// import navio from '../../../navio/src';
import 'antd/dist/antd.css';
// import { ResponsiveParallelCoordinates } from '@nivo/parallel-coordinates'
import { DataSelection, MapContainer, NavioTest, ScoreContainer, CheckboxT, SelectTrip, Onboarding, ScoreHelper, SelectScenario, ScoreTable } from './components';
import { Layout, Typography, Button } from 'antd';
// import { QuestionCircleOutlined } from '@ant-design/icons';
import './App.css';
// import { Test } from './components/test';
// import { data } from './components/data';
// import { TestD3 } from './components/D3Test';

const href =  window.location.href;
// window.href = href;
window.href = 'http://localhost:5000';
const { Sider, Content, Header } = Layout;
const { Title } = Typography;

const attributes = ['Min sog', 'Avg sog', 'Max sog', 'Distance travelled', 'Trip duration', 'Avg heading'];

const App = () => {
  const [tripsId, setTripsId] = useState([]);
  const [segmentValues, setSegmentValues] = useState(null);
  const [segments, setSegments] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [meanTrajectory, setMeanTrajectory] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState(attributes.map((_, index) => index));
  const [runOnboarding, setRunOnboarding] = useState(false);
  const [scenario, setScenario] = useState(1);

  useEffect(() => {
    document.title= "TOST"
  }, [])
  
  // console.log(navio)
  useEffect(() => {
    fetch(`${window.href}/trips-2?origin=HOUSTON&destination=NEW ORLEANS&vessel-types=70`)
    // fetch('http://localhost:5000/trips-2?origin=HOUSTON&destination=NEW ORLEANS&vessel-types=70 ')
    .then(res => res.json())
    .then(res => {
      setTripsId(res);
      loadSegmentValues(res);
      loadMedianTrajectory();
    })
  }, [])

  useEffect(() => {
    fetch(`${window.href}/segments2`)
    .then(res => res.json())
    .then(segments => {
      setSegments(segments);
      setSelected(segments.map(segment => segment.segment_number))
    })
  }, [])

  const onSelectedTripChange = (tripId) => {
    if (!tripId) {
      setSelectedTrip(null);
      return;
    }
    fetch(`${window.href}/trajectory2/${tripId}`)
    .then(res => res.json())
    .then(res => {
      setSelectedTrip({ tripId, trajectory: res});
    })
  }

  // const loadMedianTrajectory = () => {
  //   fetch(`${window.href}/mean-trajectory`)
  //   .then(res => res.json())
  //   .then(meanTraj => {
  //     setMeanTrajectory(meanTraj);
  //   })
  // }

  const loadMedianTrajectory = () => {
    fetch(`${window.href}//trajectory2/1110`)
    .then(res => res.json())
    .then(meanTraj => {
      setMeanTrajectory(meanTraj);
    })
  }

  const loadSegmentValues = (trips) => {
    const data = {
      segmentation_id: 1,
      trip_ids: trips
    }
    // fetch('http://localhost:5000/segments-values-2-2', {
    fetch(`${window.href}/segments-values-z-score-2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(res2 => res2.json())
    .then(res2 => {
      // calculate(trips, res2)
      setSegmentValues(res2);
    });
  }

  const renderSelectTrip = () => {
    return (<SelectTrip tripsId={tripsId} value={selectedTrip ? selectedTrip.tripId : undefined} onSelectedTripChange={onSelectedTripChange}/>)
  }

  const loadSegments = (startEndDates, originDestination, vesselTypes) => {
    // useEffect(() => {
      fetch(`${window.href}/segment-values?from=${startEndDates[0]}&to=${startEndDates[1]}&origin=${originDestination.origin}&destination=${originDestination.destination}&vessel-types=${vesselTypes}`)
      // fetch(`http://localhost:5000/segment-values?from=1231286519000&to=1420070371000&origin=HOUSTON&destination=NEW%20ORLEANS&vessel-types=70`)
      .then(res => res.json())
      .then(res => {
        // setSegmentValues(res[5])
        // setOriginDestinations(res);
      })
    // }, [])
  }

  const getSegmentsCheckboxOptions = () => {
    return segments.map(segment => {
      const segmentNumber = segment.segment_number;
      return {
        label: `SR_${segmentNumber}`,
        value: segmentNumber
      }
    });
  }

  const getAttributesCheckboxOptions = () => attributes.map((atr, index) => ({ label: atr, value: index }))

  return (
    <div className="App">
      <Onboarding run={runOnboarding} setRunOnboarding={setRunOnboarding} />
      <Header className='header'>
        <div className='headerTitle'>Trip Outlier Scoring Tool</div>
        {/* <SelectScenario onScenarioChange={setScenario} /> */}
        <Button onClick={() => setRunOnboarding(true)}>Tutorial</Button>
      </Header>
      <Content className='content'>
        <div className='TopContainer'>
          <div className='ComputationFiltersContainer'>
            <Title level={4}>Score computation</Title>
            <div className='SelectionContainer'>
              <div>
                <div className='SelectDescription'>Select the spatial region you want to use in the score computation</div>
                <CheckboxT options={getSegmentsCheckboxOptions()} value={selected} onChange={setSelected}/>
              </div>
              <div>
                <div className='SelectDescription'>Select the attributes you want to use in the score computation</div>
                <CheckboxT options={getAttributesCheckboxOptions()} value={selectedAttributes} onChange={setSelectedAttributes}/>
              </div>
            </div>

          </div>
          <MapContainer
            segments={segments}
            selected={selected}
            onSelectedChange={setSelected}
            selectedTrip={selectedTrip}
            meanTrajectory={meanTrajectory}
            selectTripComponent={renderSelectTrip()}
            clickable
          />
        </div>
        {segmentValues && <ScoreTable tripsId={tripsId} data={segmentValues} selectedSegments={selected} selectedAttr={selectedAttributes} onTripClick={onSelectedTripChange} scenario={scenario} />}
      </Content>
    </div>
  );
}

export default App;
