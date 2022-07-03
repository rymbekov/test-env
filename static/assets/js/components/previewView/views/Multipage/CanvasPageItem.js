import React from 'react';
import cn from 'classnames';
import renderQueue from './canvasRenderQueue';
import Logger from '../../../../services/Logger';

import Marker from '../Marker';

const WARNING_RENDER_TIME = 15;

class CanvasPageItem extends React.Component {
	canvas = React.createRef();

	isMounted = true;

	renderTask = null;

	state = {
	  canvasRendered: false,
	};

	componentDidMount() {
	  this.renderCanvas();
	}

	componentWillUnmount() {
	  this.isMounted = false;
	}

	renderCanvas = async () => {
	  const $canvas = this.canvas.current;
	  const { page } = this.props.page;
	  const scale = $canvas.width / page.getViewport({ scale: 1.0 }).width;
	  const viewport = page.getViewport({ scale });
	  $canvas.width = viewport.width;
	  $canvas.height = viewport.height;

	  renderQueue.append(async () => {
	    if (this.renderTask !== null) await this.renderTask.cancel();
	    if (!this.isMounted) return;
	    const ctx = $canvas.getContext('2d');
	    const dateStart = new Date();
	    this.renderTask = await page.render({
	      canvasContext: ctx,
	      viewport,
	    }).promise;
	    const dateEnd = new Date();
	    const renderTime = Math.round((dateEnd - dateStart) / 1000);
	    if (renderTime >= WARNING_RENDER_TIME) {
	      Logger.log(
	        'UI',
	        'PdfPageRenderWarning',
	        `Page ${this.props.number} rendered for ${renderTime}s (${window.location})`,
	      );
	    }

	    this.renderTask = null;

	    if (this.isMounted) this.setState({ canvasRendered: true });
	  });
	};

	render() {
	  const { props } = this;
	  return (
	    <div
	      className={cn('listPage', { listPageActive: props.isActive })}
	      onClick={() => props.onClick(props.number)}
	      style={{ top: props.coordinates.top }}
  >
	      {props.markers.length > 0
					&& props.markers.map((marker) => <Marker key={marker.number} showTextContent={false} marker={marker} />)}
	      <div className="listPageImage">
	        <canvas ref={this.canvas} />
  </div>
	      <div className="listPageName">
	        <div className="listPageNameText">
	          {props.number}. {props.page.name || 'unnamed'}
  </div>
	        <div className="listPageNameNum">
	          {props.number} {props.isActive && <span> / {props.total}</span>}
  </div>
  </div>
  </div>
	  );
	}
}

export default CanvasPageItem;
