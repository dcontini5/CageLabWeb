//REQUIRES THREE.js

CageLab.CageHandleControls = function ( handles, camera,  domElement ) {
	
	var _this = this
	
	var STATE = { NONE: - 1, ROTATE: 0, SCALE: 1, TRANSLATE: 2}
	
	this.handles = handles
	this.domElement = domElement
	this.camera = camera
	
	this.enabled = true
	
	this.screen = { left: 0, top: 0, width: 0, height: 0 };
	
	this.rotateSpeed = 1.0
	this.scaleSpeed = 1.2
	this.translateSpeed = 0.3
	
	this.noRotate = false
	this.noScale = false
	this.noTranslate = false
	
	this.staticMoving = false;
	this.dynamicDampingFactor = 0.2;

	this.minDistance = 0;
	this.maxDistance = Infinity;
	
	this.target = new THREE.Vector3();

	var EPS = 0.000001;

	var lastPosition = new THREE.Vector3();
	
	var _state = STATE.NONE,
		_prevState = STATE.NONE,
		
		_eye = new THREE.Vector3(),
		
		_movePrev = new THREE.Vector2(),
		_moveCurr = new THREE.Vector2(),
	

		_lastAxis = new THREE.Vector3(),
		_lastAngle = 0,

		_scaleStart = new THREE.Vector2(),
		_scaleEnd = new THREE.Vector2(),

		_translateStart = new THREE.Vector2(),
		_translateEnd = new THREE.Vector2(),
		
		_centroid = new THREE.Vector3();
		
		
	//events
	
	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };
		
	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.screen.left = 0;
			this.screen.top = 0;
			this.screen.width = window.innerWidth;
			this.screen.height = window.innerHeight;

		} else {

			var box = this.domElement.getBoundingClientRect();
			// adjustments come from similar code in the jquery offset() function
			var d = this.domElement.ownerDocument.documentElement;
			this.screen.left = box.left + window.pageXOffset - d.clientLeft;
			this.screen.top = box.top + window.pageYOffset - d.clientTop;
			this.screen.width = box.width;
			this.screen.height = box.height;

		}

	};

	this.handleEvent = function ( event ) {

		if ( typeof this[ event.type ] == 'function' ) {

			this[ event.type ]( event );

		}

	};

	var getMouseOnScreen = ( function() {
		
		var vector = new THREE.Vector2()
		
		return function getMouseOnScreen (pageX, pageY) {
			
			vector.set(
				
				(pageX - _this.screen.left) / this.screen.width,
				(pageY - _this.screen.top) / _this.screen.height 
			
			)
			
			return vector
			
		}
		
	} ()  );
	
	var getMouseOnCircle = ( function () {

		var vector = new THREE.Vector2();

		return function getMouseOnCircle( pageX, pageY ) {

			vector.set(
				( ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / ( _this.screen.width * 0.5 ) ),
				( ( _this.screen.height + 2 * ( _this.screen.top - pageY ) ) / _this.screen.width ) // screen.width intentional
			);

			return vector;

		};

	}() );
	
	this.rotateHandles = (function () {
		
		var pivot = new THREE.Object3D()
		var axis = new THREE.Vector3(),
		quaternion = new THREE.Quaternion(),
		eyeDirection = new THREE.Vector3(),
		objectUpDirection = new THREE.Vector3(),
		objectSidewaysDirection = new THREE.Vector3(),
		moveDirection = new THREE.Vector3(),
		angle;

		return function rotateHandles() {
			
			moveDirection.set( _moveCurr.x - _movePrev.x, _moveCurr.y - _movePrev.y, 0 );
			angle = moveDirection.length();

			if ( angle ) {

				_eye.copy( _this.camera.position ).sub( _this.target );
				
				_this.pivot.position.set( _centroid.x, _centroid.y, _centroid.z )
				_this.pivot.children = _this.handles
				
				eyeDirection.copy( _eye ).normalize();
				objectUpDirection.copy( _this.camera.up ).normalize();
				objectSidewaysDirection.crossVectors( objectUpDirection, eyeDirection ).normalize();

				objectUpDirection.setLength( _moveCurr.y - _movePrev.y );
				objectSidewaysDirection.setLength( _moveCurr.x - _movePrev.x );

				moveDirection.copy( objectUpDirection.add( objectSidewaysDirection ) );

				axis.crossVectors( moveDirection, _eye ).normalize();

				angle *= _this.rotateSpeed;
				quaternion.setFromAxisAngle( axis, angle );

				_eye.applyQuaternion( quaternion );
				_this.pivot.up.applyQuaternion( quaternion );

				console.log(_this.pivot.position)
				
				_lastAxis.copy( axis );
				_lastAngle = angle;

			}/* else if ( ! _this.staticMoving && _lastAngle ) {

				_lastAngle *= Math.sqrt( 1.0 - _this.dynamicDampingFactor );
				_eye.copy( _this.camera.position ).sub( _this.target );
				quaternion.setFromAxisAngle( _lastAxis, _lastAngle );
				_eye.applyQuaternion( quaternion );
				_this.camera.up.applyQuaternion( quaternion );

			}*/

			_movePrev.copy( _moveCurr );
			
			
		}
		
	} ())
	
	this.scaleHandles = (function () {
		
	} ())
	
	this.translateHandles = (function () {
		
	} ())
	
	this.checkDistances = function () {

		if ( ! _this.noScale || ! _this.noTranslate ) {

			if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {

				_this.camera.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );
				_zoomStart.copy( _zoomEnd );

			}

			if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

				_this.camera.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );
				_zoomStart.copy( _zoomEnd );

			}

		}

	};

	this.update = function () {
		

		//_eye.subVectors( _this.camera.position, _this.target );

		if ( ! _this.noRotate ) {

			_this.rotateHandles()

		}
		/*
		if ( ! _this.noScale ) {

			_this.scaleHandles()

		}

		if ( ! _this.noTranslate ) {

			_this.translateHandles()

		}
		*/
		//_this.camera.position.addVectors( _this.target, _eye )

		_this.checkDistances()

		//_this.camera.lookAt( _this.target )
/*
		if ( lastPosition.distanceToSquared( _this.camera.position ) > EPS ) {

			_this.dispatchEvent( changeEvent )

			lastPosition.copy( _this.camera.position );

		}
*/
	};

	
	this.calculateCentroid = function (){
		
		this.handles.forEach(function (handle){
			
			_centroid.add(handle.position)
			
		})
		
		_centroid.divideScalar(this.handles.length)
		
	}
	
	this.setHandles = function (handles) {
		
		this.handles = handles
		
	}
	//listeners
	
	function mousedown (event) {
		
		if(_this.enabled === false ) return
		
		event.preventDefault()
		event.stopPropagation()
		
		if(_state === STATE.NONE) {
			
			_state = event.button
			
		}
		
		if( _state === STATE.ROTATE && ! _this.noRotate ){
			
			_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) )
			_movePrev.copy( _moveCurr )
			
		} else if ( _state === STATE.SCALE && ! _this.noScale ) {
			
			_scaleStart.copy( getMouseOnScreen( event.pageX, event.pageY ) )
			_scaleEnd.copy( _scaleStart )
			
		} else if ( _state === STATE.TRANSLATE && ! _this.noTranslate ) {
			
			_translateStart.copy( getMouseOnScreen( event.pageX, event.pageY ) )
			_translateEnd.copy( _translateStart )
			
		}
		
		document.addEventListener( 'mousemove', mousemove, false )
		document.addEventListener( 'mouseup', mouseup, false )
		
		_this.dispatchEvent ( startEvent )
		
	}
	
	function mousemove (event) {
		
		if ( _this.enabled === false ) return;

		event.preventDefault()
		event.stopPropagation()
		
		if( _state === STATE.ROTATE && ! _this.noRotate ) {
			
			_movePrev.copy( _moveCurr )
			_moveCurr.copy( getMouseOnCircle (event.pageX, event.pageY ) )
			
		} else if ( _state === STATE.SCALE && ! _this.noScale ) {
			
			_scaleEnd.copy ( getMouseOnScreen ( event.pageX, event.pageY ) )
			
		} else if ( _state === STATE.TRANSLATE && ! _this.noTranslate ) {
			
			_translateEnd.copy ( getMouseOnScreen ( event.pageX, event.pageY ) )
			
		}
		
	}

	function mouseup (event) {
		
		if ( _this.enabled === false ) return;
		
		event.preventDefault()
		event.stopPropagation()

		_state = STATE.NONE

		document.removeEventListener( 'mousemove', mousemove )
		document.removeEventListener( 'mouseup', mouseup )
		_this.dispatchEvent( endEvent )
		
	}
	
	function mousewheel (event) {
		
		if ( _this.enabled === false ) return

		if ( _this.noScale === true ) return
		
		event.preventDefault()
		event.stopPropagation()
		
		switch ( event.deltaMode ) {
			
			case 2:
				
				_scaleStart.y -= event.deltaY * 0.025
				break;
			
			case 1:
				
				_scaleStart.y -= event.deltaY * 0.01
				break;
			
			default:
			
				_scaleStart.y -= event.deltaY * 0.00025
				break;

		}
		
		_this.dispatchEvent( startEvent )
		_this.dispatchEvent( endEvent )
		
	}
	
	function contextmenu( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault()

	}
	
	this.dispose = function () {

		this.domElement.removeEventListener( 'contextmenu', contextmenu, false )
		this.domElement.removeEventListener( 'mousedown', mousedown, false )
		this.domElement.removeEventListener( 'wheel', mousewheel, false )

		document.removeEventListener( 'mousemove', mousemove, false )
		document.removeEventListener( 'mouseup', mouseup, false )

	}
	
	this.domElement.addEventListener( 'contextmenu', contextmenu, false )
	this.domElement.addEventListener( 'mousedown', mousedown, false )
	this.domElement.addEventListener( 'wheel', mousewheel, false )
	
	
	this.calculateCentroid()
	this.update()
}

CageLab.CageHandleControls.prototype = Object.create( THREE.EventDispatcher.prototype );
CageLab.CageHandleControls.prototype.constructor = CageLab.CageHandleControls;