import React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveBar } from '@nivo/bar';

import { ThemeConsumer } from '../../../contexts/themeContext';

const BarGraph = ({ data }) => (
  <ThemeConsumer>
    {({ themes }) => {
      let count = 0;
      let tickEvery = 0;

      if (data.length <= 14) {
        tickEvery = 1;
      } else if (data.length <= 30) {
        tickEvery = 2;
      } else {
        tickEvery = Math.round(data.length / 10);
      }

      const maxValueByY = Math.max(...data.map(i => i.value)) < 3;
      const axisMarkersArr = [
      {
          axis: 'y',
          value: 0,
        lineStyle: { stroke: themes.chartAxisLineColor, strokeWidth: 0.5 },
          legend: '',
          legendOrientation: 'vertical',
      },
      {
          axis: 'y',
        value: Math.floor((Math.max(...data.map(i => i.value)) / 2) * 1.2),
        lineStyle: { stroke: themes.chartAxisLineColor, strokeWidth: 0.5, zIndex: 1 },
          legend: '',
          legendOrientation: 'vertical',
      },
      {
          axis: 'y',
        value: Math.floor(Math.max(...data.map(i => i.value)) * 1.2),
        lineStyle: { stroke: themes.chartAxisLineColor, strokeWidth: 0.5 },
          legend: '',
          legendOrientation: 'vertical',
      },
      ];

      return (
        <ResponsiveBar
          margin={{ top: 5, right: 40, bottom: 75, left: -5 }}
          data={data}
          indexBy="date"
          keys={['value']}
          enableGridX={false}
          enableGridY={!maxValueByY}
          colors={themes.chartLineColor}
          animate={false}
          enableLabel={false}
          maxValue={Math.max(...data.map(i => i.value)) * 1.2}
          axisBottom={{
            tickRotation: -90,
            legendOffset: 12,
            format: i => (count++ % tickEvery === 0 ? i : ''),
          }}
          axisLeft={{
            tickSize: 0,
          }}
          axisRight={{
            orient: 'right',
            tickSize: 0,
            tickPadding: 10,
            tickValues: [
              0,
            Math.floor((Math.max(...data.map(i => i.value)) / 2) * 1.2),
            Math.floor(Math.max(...data.map(i => i.value)) * 1.2),
            ],
            // format: e => (Math.floor(e) === e && e) || '',
          }}
          markers={maxValueByY ? axisMarkersArr : null}
          tooltip={({ color, value, indexValue }) => (
            <strong style={{ color }}>
              {indexValue}: {value}
            </strong>
          )}
          theme={{
            axis: {
              ticks: {
                line: {
                  stroke: themes.chartAxisLineColor,
                },
                text: {
                  fill: themes.chartAxisColor,
                },
              },
            },
            grid: {
              line: {
                stroke: themes.chartAxisLineColor,
                strokeWidth: 0.5,
                strokeDasharray: '2 2',
              },
            },
          }}
        />
      );
    }}
  </ThemeConsumer>
);

BarGraph.defaultProps = {
  data: [],
};
BarGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string,
    value: PropTypes.number,
  })),
};

export default BarGraph;
