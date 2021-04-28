const MyResponsiveParallelCoordinates = ({ data /* see data tab */ }) => (
  <ResponsiveParallelCoordinates
      data={data}
      variables={[
          {
              key: 'trip_id',
              type: 'linear',
              min: 'auto',
              max: 'auto',
              ticksPosition: 'before',
              legend: 'trip',
              legendPosition: 'start',
              legendOffset: 20
          },
          {
              key: 'timestamp_in_millis',
              type: 'linear',
              min: 'auto',
              max: 'auto',
              ticksPosition: 'before',
              legend: 'time',
              legendPosition: 'start',
              legendOffset: 20
          },
          {
              key: 'distance_in_nm',
              type: 'linear',
              min: 'auto',
              max: 'auto',
              ticksPosition: 'before',
              legend: 'distance',
              legendPosition: 'start',
              legendOffset: 20
          },
          {
              key: 'duration_in_sec',
              type: 'linear',
              min: 'auto',
              max: 'auto',
              ticksPosition: 'before',
              legend: 'duration',
              legendPosition: 'start',
              legendOffset: 20
          },
          {
              key: 'min_sog',
              type: 'linear',
              min: 'auto',
              max: 'auto',
              ticksPosition: 'before',
              legend: 'min_sog',
              legendPosition: 'start',
              legendOffset: 20
          },
          {
              key: 'avg_sog',
              type: 'linear',
              min: 'auto',
              max: 'auto',
              ticksPosition: 'before',
              legend: 'avg_sog',
              legendPosition: 'start',
              legendOffset: 20
          },
          {
              key: 'max_sog',
              type: 'linear',
              min: 'auto',
              max: 'auto',
              ticksPosition: 'before',
              legend: 'max_sog',
              legendPosition: 'start',
              legendOffset: 20
          },
          {
              key: 'start_heading',
              type: 'linear',
              min: 'auto',
              max: 'auto',
              ticksPosition: 'before',
              legend: 'start_heading',
              legendPosition: 'start',
              legendOffset: 20
          },
        {
            key: 'end_heading',
            type: 'linear',
            min: 'auto',
            max: 'auto',
            ticksPosition: 'before',
            legend: 'max_heading',
            legendPosition: 'start',
            legendOffset: 20
        },
        {
            key: 'max_heading_change',
            type: 'linear',
            min: 'auto',
            max: 'auto',
            ticksPosition: 'before',
            legend: 'avg_heading',
            legendPosition: 'start',
            legendOffset: 20
        },
        {
            key: 'vessel_type',
            type: 'linear',
            min: 'auto',
            max: 'auto',
            ticksPosition: 'before',
            legend: 'vessel_type',
            legendPosition: 'start',
            legendOffset: 20
        },
        {
            key: 'segment_number',
            type: 'linear',
            min: 'auto',
            max: 'auto',
            ticksPosition: 'before',
            legend: 'segment_number',
            legendPosition: 'start',
            legendOffset: 20
        },
      ]}
      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      animate={true}
      motionStiffness={90}
      motionDamping={12}
      curve='natural'
  />
)
