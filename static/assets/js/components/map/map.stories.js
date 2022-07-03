import React from 'react';
import Map from './index';
import './../../../css/picsio.scss';
import './stories.scss';

export default { title: 'Map' };

const locations = [
	{ lat: 52.3545494078, lng: 4.8879227636 },
	{ lat: 52.3702545164, lng: 4.9011902808 },
	{ lat: 52.3546295164, lng: 4.8878345489 },
	{ lat: 52.35931015, lng: 4.8655200003 },
	{ lat: 52.3776969908, lng: 4.8954086303 },
	{ lat: 52.3772621153, lng: 4.8942074775 },
	{ lat: 52.3607215881, lng: 4.8796210289 },
	{ lat: 52.3619194031, lng: 4.8644771575 },
	{ lat: 52.3618545531, lng: 4.8809628486 },
];

export const Main = () => (
	<div className="mapWrapper">
		<Map locations={locations} />
	</div>
);
