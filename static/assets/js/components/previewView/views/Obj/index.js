import React from 'react';
import {
  object, bool, func, oneOfType,
} from 'prop-types';
import _OrbitControls from 'three-orbit-controls';
import getDownloadUrl from '../../../../helpers/getDownloadUrl';
import ToolbarPreviewLeft from '../../../toolbars/ToolbarPreviewLeft';
import Icon from '../../../Icon';
import Logger from '../../../../services/Logger';
import * as utils from '../../../../shared/utils';
import localization from '../../../../shared/strings';
import Spinner from '../Spinner';

let THREE = null;
let OrbitControls = null;
let Loader = null;
const getTHREE = () => import(/* webpackChunkName: "three" */ 'three/build/three.min.js').then((three) => {
  OrbitControls = _OrbitControls(three);
  THREE = three;
  return import(/* webpackChunkName: "objLoader" */ './loader').then((loader) => {
    Loader = loader.default(THREE);
  });
});

class Obj extends React.PureComponent {
	/** Prop types */
	static propTypes = {
	  asset: object,
	  isMainApp: bool,
	  addRevision: oneOfType([bool, func]),
	  handleDownload: func,
	  moveToTrash: oneOfType([bool, func]),
	};

	state = {
	  isLoaded: false,
	  isError: false,
	};

	$container = React.createRef();

	async componentDidMount() {
	  this._mounted = true;
	  try {
	    await getTHREE();
	  } catch (err) {
	    Logger.error(new Error('Can not init 3D viewr'), { error: err, showDialog: true });
	  }
	  this.init();
	}

	componentDidUpdate(prevProps) {
	  if (prevProps.asset._id !== this.props.asset._id) this.loadFile();
	}

	componentWillUnmount() {
	  this._mounted = false;
	  this.destroy();
	}

	init = () => {
	  this.renderer = new THREE.WebGLRenderer();
	  this.renderer.setPixelRatio(window.devicePixelRatio);
	  this.renderer.setSize(this.$container.current.offsetWidth, this.$container.current.offsetHeight);
	  this.$container.current.appendChild(this.renderer.domElement);
	  this.loadFile();

	  window.addEventListener('preview:ui:resize', this.onWindowResize, false);
	  window.addEventListener('revision:added', this.loadFile, false);
	  window.addEventListener('resize', this.onWindowResize, false);
	};

	loadFile = async () => {
	  if (this.request) {
	    this.request.abort();
	    this.request = null;
	  }
	  this.setState({
	    isLoaded: false,
	    isError: false,
	  });
	  const { asset } = this.props;
	  let url;
	  try {
	    url = await getDownloadUrl({ assetId: asset._id, allowDownloadByGS: false });
	  } catch (err) {
	    Logger.error(new Error('Can not get url for Obj file', { error: err, showDialog: true }));
	  }

	  this.camera = new THREE.PerspectiveCamera(
	    60,
	    this.$container.current.offsetWidth / this.$container.current.offsetHeight,
	    0.1,
	    3000,
	  );
	  this.camera.position.z = 200;

	  this.scene = new THREE.Scene();
	  const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
	  this.scene.add(ambientLight);

	  const pointLight = new THREE.PointLight(0xffffff, 0.8);
	  this.camera.add(pointLight);
	  this.scene.add(this.camera);

	  this.controls = new OrbitControls(this.camera, this.$container.current);

	  const loader = new Loader();
	  this.request = loader.load(url, this.onLoad, null, this.onError, null, true);
	};

	onLoad = (object) => {
	  if (this._mounted) {
	    this.scene.add(object.detail.loaderRootNode);
	    this.request = null;
	    this.onWindowResize();
	    this.setState({ isLoaded: true }, this.animate);
	  }
	};

	onError = (err) => {
	  if (this._mounted) this.setState({ isError: true, isLoaded: true });
	  console.error(err);
	};

	onWindowResize = () => {
	  this.camera.aspect = this.$container.current.offsetWidth / this.$container.current.offsetHeight;
	  this.camera.updateProjectionMatrix();
	  this.renderer.setSize(this.$container.current.offsetWidth, this.$container.current.offsetHeight);
	};

	animate = () => {
	  if (this._mounted) requestAnimationFrame(this.animate);
	  this._render();
	};

	_render = () => {
	  this.controls.update();
	  this.renderer.render(this.scene, this.camera);
	};

	destroy = () => {
	  if (this.request) {
	    this.request.abort();
	    this.request = null;
	  }
	  const $canvas = this.renderer.domElement;
	  if (this.$container.current.contains($canvas)) {
	    this.$container.current.removeChild($canvas);
	  }
	  this.renderer.dispose();
	  window.removeEventListener('preview:ui:resize', this.onWindowResize, false);
	  window.removeEventListener('revision:added', this.loadFile, false);
	  window.removeEventListener('resize', this.onWindowResize, false);
	};

	render() {
	  const { isLoaded, isError } = this.state;
	  const {
	    isMainApp, addRevision, handleDownload, moveToTrash, asset,
	  } = this.props;
	  const isRestricted = utils.isAssetRestricted(asset.restrictSettings);

	  return (
	    <div className="innerContainerMediaFile">
	      {isMainApp && (
  <ToolbarPreviewLeft
	          assetId={asset._id}
	          addRevision={addRevision}
	          download={handleDownload}
	          moveToTrash={moveToTrash}
	          permissions={asset.permissions}
	          isRestricted={isRestricted}
	          isRemoveForever={this.props.isRemoveForever}
	        />
	      )}
	      <div className="theMediaFile" ref={this.$container} />
	      {!isLoaded && <Spinner title={localization.SPINNERS.LOADING} />}
	      {isError && (
  <div className="placeholderMediaFile">
	          <div className="innerPlaceholderMediaFile">
	            <div className="icon" style={{ color: '#474747' }}>
	              <Icon name="error" />
  </div>
	            <div className="text">{localization.PREVIEW_VIEW.errorLoadFile}</div>
	            <div className="fileName">{this.props.asset.name}</div>
    </div>
	        </div>
	      )}
  </div>
	  );
	}
}

export default Obj;
