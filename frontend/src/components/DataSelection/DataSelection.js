import React, { useState, useEffect } from 'react';
import { DatePicker, Typography, Select, Checkbox, Row, Col, Button } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Option } = Select;

let startEndDates;
let selectedOriginDest;
let selectedVesselTypes;
export const DataSelection = (props) => {
  const [minMaxDates, setMinMaxDates] = useState(null)
  const [originDestinations, setOriginDestinations] = useState(null);
  const [vesselTypes, setVesselTypes] = useState(null);

  useEffect(() => {
    fetch(`${window.href}/date-range`)
    .then(res => res.json())
    .then(res => {
      startEndDates = [res.start, res.end];
      setMinMaxDates([moment(res.start), moment(res.end)]);
    })
  }, [])

  useEffect(() => {
    fetch(`${window.href}/origin-destinations`)
    .then(res => res.json())
    .then(res => {
      setOriginDestinations(res);
    })
  }, [])

  useEffect(() => {
    fetch(`${window.href}/vessel-types`)
    .then(res => res.json())
    .then(res => {
      setVesselTypes(res)
    })
  }, [])

  const onDateRangeChange = (startEndTimestampMoment) => {
    if(!startEndTimestampMoment) {
      return startEndDates = null;
    }
    startEndDates = startEndTimestampMoment.map(momentDate => momentDate.format('x'));
  }

  const onFilterChange = (index) => {
    selectedOriginDest = originDestinations[index];
  }

  const onCheckboxChange = (selectedTypes) => {
    selectedVesselTypes = selectedTypes;
  }

  const onClick = () => {
    props.loadData(startEndDates, selectedOriginDest, selectedVesselTypes);
  }

  const renderPlaceholder = () => (
    <div>Placeholder</div>
  )

  const renderContent = () => (
    <div>
      <div>Select date</div>
      <RangePicker
        disabledDate={d => !d ||  d.isBefore(minMaxDates[0]) || d.isAfter(minMaxDates[1]) }
        defaultValue={minMaxDates}
        onChange={onDateRangeChange}
      />

      <div>Select origin - destination</div>
      <Select
        showSearch
        style={{ width: '100%' }}
        placeholder="Select origin-destination"
        optionFilterProp="children"
        onChange={onFilterChange}
        filterOption={(input, option) =>
          option.children.join('').toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        { originDestinations.map((originDestination, index) => (
          <Option key={index} value={index}>{originDestination.origin.toLowerCase()}-{originDestination.destination.toLowerCase()}</Option>
        ))}
      </Select>

      <div>Select vessels</div>
      <Checkbox.Group style={{ width: '100%' }} onChange={onCheckboxChange}>
        <Row>
          {vesselTypes.map(vesselType => (
            <Col key={vesselType} span={8}>
              <Checkbox value={vesselType}>{vesselType}</Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>

      <Button type="primary" block onClick={onClick}>Run</Button>
      <div>Number or trips: {props.numTrips}</div>
    </div>
  )

  return (
    <>
      <Title level={4}>Data Selecion</Title>
      <hr/>
      { minMaxDates && originDestinations && vesselTypes ? renderContent() : renderPlaceholder() }
    </>
  )
}
