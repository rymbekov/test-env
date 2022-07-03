import React from 'react'; // eslint-disable-line
import { string, func } from 'prop-types';
import * as utils from '../../shared/utils';

const BreadcrumbsItem = ({ _id, title, onClick }) => (
  <li className={!_id ? 'disabled' : null}>
    <span onClick={() => onClick(_id)}>{utils.decodeSlash(title)}</span>
  </li>
);

BreadcrumbsItem.propTypes = {
  _id: string,
  title: string,
  onClick: func,
};

export default BreadcrumbsItem;
