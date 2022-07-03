import React from 'react';
import PropTypes from 'prop-types';
import { ResponsivePie } from '@nivo/pie';
import clsx from 'classnames';

import { ThemeConsumer } from '../../../contexts/themeContext';

const colors = ['#ffcc00', '#e41a1c', '#6600ff', '#9900ff', '#ffff00', '#0000ff', '#3333ff', '#3399ff'];
const emptyData = [{ name: 'empty', id: 'empty', label: '', value: 100 }];

const PieGraph = props => {
	const { fetching, data, total } = props;

	return (
		<ThemeConsumer>
			{({ themes }) => {
				const { chartLineColor } = themes;

				return (
					<div className={clsx('pieGraphInner', { loading: fetching })}>
						<div className="pieLegend">
							{data.map((item, index) => {
								const { id, name, value } = item;
								const percentValue = ((value / total) * 100).toFixed(2);
								const percentStringValue = `${percentValue} %`;
								const legend = total ? `${value} ${name} - ${percentStringValue}` : name;
								const color = !index ? chartLineColor : colors[index - 1];

								return (
									<div key={id} className="pieLegendLine">
										<div className="spot" style={{ background: color }} />
										<span>{legend}</span>
									</div>
								);
							})}
						</div>
						<div className="pieWrapper">
							<ResponsivePie
								data={!total ? emptyData : data}
								margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
								innerRadius={0.6}
								padAngle={0}
								cornerRadius={0}
								borderWidth={!total ? 1 : 0}
								borderColor={themes.chartAxisLineColor}
								enableRadialLabels={false}
								enableSlicesLabels={false}
								animate
								isInteractive
								motionStiffness={90}
								motionDamping={15}
								colors={{ scheme: 'dark2' }}
								defs={[
									{
										id: 'colorEmpty',
										type: 'patternLines',
										background: 'transparent',
										color: 'transparent',
									},
									{
										id: 'colorAccepted',
										type: 'patternLines',
										background: chartLineColor,
										color: chartLineColor,
									},
									{
										id: 'colorWaiting',
										type: 'patternLines',
										background: '#ffcc00',
										color: '#ffcc00',
									},
									{
										id: 'colorVideo',
										type: 'patternLines',
										background: '#ffcc00',
										color: '#ffcc00',
									},
									{
										id: 'colorText',
										type: 'patternLines',
										background: '#6600ff',
										color: '#6600ff',
									},
									{
										id: 'colorPDF',
										type: 'patternLines',
										background: '#9900ff',
										color: '#9900ff',
									},
									{
										id: 'colorSketch',
										type: 'patternLines',
										background: '#ffff00',
										color: '#ffff00',
									},
									{
										id: 'colorRaw',
										type: 'patternLines',
										background: '#0000ff',
										color: '#0000ff',
									},
									{
										id: 'colorPhotoshop',
										type: 'patternLines',
										background: '#3333ff',
										color: '#3333ff',
									},
									{
										id: 'color3D',
										type: 'patternLines',
										background: '#3399ff',
										color: '#3399ff',
									},
									{
										id: 'colorAudio',
										type: 'patternLines',
										background: '#e41a1c',
										color: '#e41a1c',
									},
								]}
								fill={[
									{
										match: {
											id: 'empty',
										},
										id: 'colorEmpty',
									},
									{
										match: {
											id: 'accepted',
										},
										id: 'colorAccepted',
									},
									{
										match: {
											id: 'waiting',
										},
										id: 'colorWaiting',
									},
									{
										match: {
											id: 'images',
										},
										id: 'colorAccepted',
									},
									{
										match: {
											id: 'video',
										},
										id: 'colorVideo',
									},
									{
										match: {
											id: 'audio',
										},
										id: 'colorAudio',
									},
									{
										match: {
											id: 'text',
										},
										id: 'colorText',
									},
									{
										match: {
											id: 'pdf',
										},
										id: 'colorPDF',
									},
									{
										match: {
											id: 'sketch',
										},
										id: 'colorSketch',
									},
									{
										match: {
											id: 'raw',
										},
										id: 'colorRaw',
									},
									{
										match: {
											id: 'photoshop',
										},
										id: 'colorPhotoshop',
									},
									{
										match: {
											id: '3d',
										},
										id: 'color3D',
									},
								]}
							/>
						</div>
					</div>
				);
			}}
		</ThemeConsumer>
	);
};

PieGraph.defaultProps = {
  fetching: false,
	data: [],
	total: 0,
};
PieGraph.propTypes = {
  fetching: PropTypes.bool,
	data: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string,
		label: PropTypes.string,
		name: PropTypes.string,
		value: PropTypes.number,
	})),
	total: PropTypes.number,
};

export default PieGraph;
