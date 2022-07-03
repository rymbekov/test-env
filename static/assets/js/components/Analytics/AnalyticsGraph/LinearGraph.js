import React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveLine } from '@nivo/line';
import dayjs from 'dayjs';

import { ThemeConsumer } from '../../../contexts/themeContext';
import { linearChartBottomAxis } from '../../../shared/dateLocale';

const LinearGraph = ({ data }) => (
  <ThemeConsumer>
    {({ themes }) => (
      <ResponsiveLine
        data={[{ id: 'someId', data }]}
        theme={{
          axis: {
            ticks: {
              text: {
                fill: themes.chartAxisColor,
              },
            },
          },
          grid: {
            line: {
              stroke: themes.chartAxisLineColor,
              strokeWidth: 1,
              strokeDasharray: '2 2',
            },
          },
        }}
        margin={{ top: 5, right: 40, bottom: 75, left: 5 }}
        yScale={{ type: 'linear', min: 0, max: Math.max(...data.map(i => i.y)) * 1.2 }}
        xScale={{
          type: 'time',
          format: '%Y-%m-%d',
          precision: 'day',
        }}
        xFormat="time:%Y-%m-%d"
        axisBottom={{
          format: linearChartBottomAxis,
          // tickValues: `every ${Math.round(data[0].data.length / 5)} days`,
          tickRotation: -90,
          legendOffset: -12,
          tickValues: 7,
        }}
        axisRight={{
          orient: 'right',
          tickSize: 0,
          tickPadding: 10,
          // format: e => (Math.floor(e) === e && e) || '',
          tickValues: [
            0,
          Math.floor((Math.max(...data.map(i => i.y)) / 2) * 1.2),
          Math.floor(Math.max(...data.map(i => i.y)) * 1.2),
          ],
        }}
        sliceTooltip={(slice, index) => {
          const { axis } = slice;
          const { yFormatted } = slice.slice.points[0].data;

          return (
            <div
              key={`tooltip-${axis}-${index}`}
              style={{
                background: 'white',
                padding: '9px 12px',
                border: '1px solid #ccc',
                color: themes.chartLineColor,
              }}
            >
              <b>
                {dayjs(slice.slice.points[0].data.xFormatted).format('ll')}: {yFormatted}
              </b>
            </div>
          );
        }}
        enableSlices="x"
        indexBy="date"
        keys={['value']}
        axisLeft={null}
        axisTop={null}
        colors={themes.chartLineColor}
        pointSize={2}
        enableGridX={false}
        areaBaselineValue={0}
        useMesh
        enablePoint
        enableCrosshair={false}
        motionStiffness={80}
        lineWidth={3}
        animate={false}
        enableArea
        areaOpacity={0.9}
      />
    )}
  </ThemeConsumer>
);

LinearGraph.defaultProps = {
  data: [],
};
LinearGraph.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    x: PropTypes.string,
    value: PropTypes.number,
  })),
};

export default LinearGraph;
