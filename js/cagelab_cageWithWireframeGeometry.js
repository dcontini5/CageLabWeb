
CageLab.Viewer = function (canvas_width, canvas_height){
	
	const self = this
	
	this.width = canvas_width
	this.height = canvas_height
	this.aspect = this.width / this.height
	
	this.create_renderer()
	
	this.create_camera()
	
	this.create_scene()
	
	this.materials = []
	
	this.materials.mesh_material = new THREE.MeshStandardMaterial( { 
		
			color: 0x00ff00 ,
			roughness: .75,
			metalness: 0,
			
		} )
	
	//this.materials.mesh_smooth
	this.materials.mesh_wireframe_material = new THREE.LineMaterial({
		
		color: 0x0000000,
		linewidth: 1,
		dashed: false,
		
	})
	
	this.materials.cage_material = new THREE.LineMaterial({
		
		color: 0x0000000,
		linewidth: 1,
		dashed: false,
		
	})
	
	this.materials.points_material = new THREE.PointsMaterial( {
			
			color: 0x0000000,
			size: 1,
				
		} );
	
	
	
}

Object.assign(CageLab.Viewer.prototype, {
	
	create_renderer: function() {
		
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(this.width, this.height);
		this.renderer.setClearColor( 0xffffff, 1.0 );
	},
	
	create_camera: function(){
		
		this.camera = new THREE.PerspectiveCamera (60, this.aspect, .1, 1000);
		this.camera = new THREE.PerspectiveCamera (60, this.aspect, .1, 1000);
	
		this.camera.position.set(0, 0, 200);
		
		this.camera.add( new THREE.PointLight( 0xffffff, 0.8));
		
		
	},
	
	create_scene: function(){
		
		this.scene = new THREE.Scene();
		this.scene.add(	new THREE.AmbientLight (0xcccccc, 0.4));
		this.scene.add(this.camera);
		
	},
	
	get_element: function(){ return this.renderer.domElement; },
	
	get_camera: function() { return this.camera; },
	
	render_scene: function() {
		
		this.materials.mesh_wireframe_material.resolution.set( this.width, this.height );
		this.materials.cage_material.resolution.set( this.width, this.height );
		this.renderer.render(this.scene, this.camera);
		
	},
	
	resize: function (width, height) {
		
        this.width = width;
        this.height = height;
        this.aspect = width / height;
        
        this.camera.aspect = this.aspect;
        this.camera.updateProjectionMatrix();

        
        this.renderer.setSize(width, height);
    },
	
	
	
})

CageLab.App = function (dom_element){
	
	this.barycentric_coords =  {
		
		NONE: 1,
		MVC: 2,
		GREEN: 3,
		
	}
	
	this.barycentric_mode = this.barycentric_coords.NONE;
	
	this.backend = new Module.App();
	
	const self = this
	
	CageLab.app = this
	
	var width = dom_element.offsetWidth
    var height = dom_element.offsetHeight
	
	this.viewer = new CageLab.Viewer(width, height)
	
	this.canvas = {
		
		element: this.viewer.get_element(),
		container: dom_element
		
	}
	
	this.mesh = {}
	
	this.cage = {
		
		handles: [],
		active_handles: [],
		needs_update: false,
	}
	
	this.canvas.container.appendChild(this.canvas.element)
	
	this.controls = new THREE.TrackballControls( this.viewer.get_camera(), dom_element )
	this.controls.panSpeed = 0.1
	this.controls.enabled = false
	
	this.create_manager()
	
	this.loaders = []
	
	this.loaders.file_loader = new THREE.FileLoader(this.manager)
	
	this.loaders.obj_loader = new THREE.OBJLoader(this.manager)
	
    window.addEventListener('resize', this.resize.bind(this))
	
}

Object.assign(CageLab.App.prototype, {
	
	resize: function () {
        var width   = this.canvas.container.offsetWidth;
        var height  = this.canvas.container.offsetHeight;
        this.viewer.resize(width, height);  
		this.viewer.render_scene();
    },
	
	select_handle: function( event ) {
	
		CageLab.app.controls.enabled = false;
		var mouse = new THREE.Vector2();
		var raycaster = new THREE.Raycaster();
		
		var domElement = CageLab.app.canvas.element;
		var camera = CageLab.app.viewer.get_camera();
		var objects = CageLab.app.cage.handles;
		
			
		event.preventDefault();
			
		var rect = domElement.getBoundingClientRect();
				
		mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
				
		raycaster.setFromCamera( mouse, camera );
		
		var intersects = raycaster.intersectObjects( objects );
				
		if( intersects.length > 0 ) {
					
			selected = intersects[0].object;
			if(selected.name != "marked"){
				
				selected.name = "marked";
				var c = new THREE.Color(0xff0000);
				selected.material.color = c;
				CageLab.app.cage.active_handles.push(selected);
				
			}
					
		}
		
	},
	
	unselect_handle: function( event ) {
	
		var mouse = new THREE.Vector2();
		var raycaster = new THREE.Raycaster();
		
		var domElement = CageLab.app.canvas.element;
		var camera = CageLab.app.viewer.get_camera();
		var objects = CageLab.app.cage.active_handles;
		
			
		event.preventDefault();
			
		var rect = domElement.getBoundingClientRect();
				
		mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
				
		raycaster.setFromCamera( mouse, camera );
				
		var intersects = raycaster.intersectObjects( objects )
				
		if( intersects.length > 0 ) {
					
			selected = intersects[0].object;
			var c = new THREE.Color(0x0000ff);
			selected.material.color = c;
			var index = objects.indexOf(selected);
			objects.splice(index, 1);
			selected.name = "";
					
		}
		
	},
	
	interaction_toolbar_event: function(active_now){
		
		switch(active_now) {
			
			case 'camera_controls':
			
				//this.cage.needs_update = false;
				this.canvas.element.removeEventListener('mousedown', CageLab.app.select_handle, false);
				this.canvas.element.removeEventListener('mousedown', CageLab.app.unselect_handle, false);
				this.controls.enabled = true;
				this.controls.moveHandles = false;
				break;
				
			case 'select_handles':
				
				this.controls.enabled = false;
				this.controls.moveHandles = false;
				this.canvas.element.removeEventListener('mousedown', CageLab.app.unselect_handle, false);
				this.canvas.element.addEventListener('mousedown', CageLab.app.select_handle, false);
				break;
				
			case 'unselect_handles':
				
				this.controls.enabled = false;
				this.controls.moveHandles = false;
				this.canvas.element.removeEventListener('mousedown', CageLab.app.select_handle, false);
				this.canvas.element.addEventListener('mousedown', CageLab.app.unselect_handle, false);
				break;
				
			case 'move_handles':
			
				this.canvas.element.removeEventListener('mousedown', CageLab.app.unselect_handle, false);
				this.canvas.element.removeEventListener('mousedown', CageLab.app.select_handle, false);
				
				if(this.cage.active_handles.length > 1){
					
					this.controls.setHandles( this.cage.active_handles, this.viewer.scene );
					this.controls.enabled = true;
					this.controls.moveHandles = true;
				}
				break;
			
			
		}
		
	},
	
	create_manager: function(){
		
		this.manager = new THREE.LoadingManager();
			 
		this.manager.onStart = function ( url, itemsLoaded, itemsTotal ) { 
		//	console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' ); 
		}; 
		
		this.manager.onLoad = function ( ) { 
			console.log( 'Loading complete!');
		}; 
		
		this.manager.onProgress = function ( url, itemsLoaded, itemsTotal ) { 
		//	console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' ); 
		}; 
		this.manager.onError = function ( url ) {
		//	console.log( 'There was an error loading ' + url ); 
		};
		
		
		
	},
	
	loader_selector: function(is_mesh){
		
		this.is_mesh = is_mesh;
		
	},
	
	set_mesh_default: function() {
		
		//this.mesh.model.geometry.computeVertexNormals();
		
		var geometry = this.create_geometry( this.mesh.vertices, this.mesh.faces );
		
		
		
		
		this.mesh.model = new THREE.Mesh(geometry, this.viewer.materials.mesh_material);
		
		
		
		this.mesh.points = new THREE.Points( geometry , this.viewer.materials.points_material );
		
		
	},
	
	
	load_mesh: function(url, name) {
		
		if(this.is_mesh) {
			this.loaders.file_loader.load(url, function (data) {
				
				//CageLab.app.mesh.model = CageLab.app.loaders.obj_loader.parse(data).children[0]
				CageLab.app.parse_geometry(data);
				
				CageLab.app.set_mesh_default();
				
				CageLab.app.viewer.scene.add(CageLab.app.mesh.model);
			
				CageLab.app.mesh.name = name;
				
				CageLab.app.mesh.wireframe = CageLab.app.create_wireframe(CageLab.app.mesh.model.geometry)
				CageLab.app.viewer.scene.add(CageLab.app.mesh.wireframe);
				
				CageLab.UI.mesh.on_mesh_load();
				
			})
		}else{
			
			this.loaders.file_loader.load(url, function (data) {
				
				CageLab.app.parse_geometry(data);
				
				CageLab.app.cage.wireframe = CageLab.app.create_wireframe(CageLab.app.create_geometry( CageLab.app.cage.vertices, CageLab.app.cage.faces ));
				
				CageLab.app.viewer.scene.add(CageLab.app.cage.wireframe);
			
				CageLab.app.cage.name = name;
				
				CageLab.app.parse_geometry(data);
				
				CageLab.app.create_cage_handles();
				
				CageLab.UI.cage.on_cage_load();
				
				
			})
			
		}
		
	},
	
	create_geometry: function(vertices, faces) {
		
		var geometry = new THREE.Geometry();
		var vertices_array = [];
		
		for(var i=1; i<=faces.length; i++){
		
		
			var x = vertices[faces[i-1]*3-3];
			var y = vertices[faces[i-1]*3-2];
			var z = vertices[faces[i-1]*3-1];
			vertices_array.push( new THREE.Vector3(x, y, z) );
			
		}
		
		var faces_array = []
		
		for(var i = 0, n = vertices_array.length; i < n; i += 3) {
			
            faces_array.push(new THREE.Face3(i, i + 1, i + 2));
        }
		
		geometry.vertices = vertices_array;
        geometry.faces = faces_array;
        geometry.computeFaceNormals();
        geometry.mergeVertices();
        geometry.computeVertexNormals();
		var buffer_g = new THREE.BufferGeometry();
		buffer_g.fromGeometry(geometry);
		
		return buffer_g;
		
	},
	
	update_geometry: function(vertices, faces){
		
		var points_array =  new Float32Array(faces.length*3);
		
		for(var i=1; i<=faces.length; i++){
		
		
			points_array[i*3-3] = vertices[faces[i-1]*3-3];
			points_array[i*3-2] = vertices[faces[i-1]*3-2];
			points_array[i*3-1] = vertices[faces[i-1]*3-1];
			
			
		}
		
		return points_array;
		
	},
	
	
	update_geometry: function(vertices, faces){
		
		var points_array =  new Float32Array(faces.length*3);
		
		for(var i=1; i<=faces.length; i++){
		
		
			points_array[i*3-3] = vertices[faces[i-1]*3-3];
			points_array[i*3-2] = vertices[faces[i-1]*3-2];
			points_array[i*3-1] = vertices[faces[i-1]*3-1];
			
			
		}
		
		return points_array;
		
	},
	
	
	/*
	
	
	create_geometry_from_handles: function() {
		
		var handles = this.cage.handles;
		var faces = this.cage.faces;
		var vertices = this.cage.vertices;
		
		var new_vertices = new Float32Array(faces.length*3);
		var geometry = new THREE.BufferGeometry();
		
		for(var i=1; i<=faces.length; i++){
		
		
			new_vertices[i*3-3] = handles[faces[i-1]-1].position.x;
			new_vertices[i*3-2] = handles[faces[i-1]-1].position.y;
			new_vertices[i*3-1] = handles[faces[i-1]-1].position.z;
		
		}
		
		for(var i=0; i<this.cage.active_handles.length; i++){
			
			var j = handles.indexOf(this.cage.active_handles[i])*3
			
			
			vertices[j] = this.cage.active_handles[i].position.x;
			vertices[j+1] = this.cage.active_handles[i].position.y;
			vertices[j+2] = this.cage.active_handles[i].position.z;
			
			
		}
	
		geometry.addAttribute( 'position', new THREE.BufferAttribute( new_vertices, 3 ) );
		geometry.computeVertexNormals ();
		
		return geometry;
		
	},	
	
*/
	create_wireframe: function(geometry) {
		
		var wireframe_geometry = new THREE.WireframeGeometry2( geometry );
		if(this.is_mesh){
			
			var wireframe = new THREE.Wireframe( wireframe_geometry, this.viewer.materials.mesh_wireframe_material );
			wireframe.visible = false;
			
		}else{
			
			var wireframe = new THREE.Wireframe( wireframe_geometry, this.viewer.materials.cage_material );
		
		}
		
		return wireframe;
		
	},
	/*
	updateCage: function(){
		
		var geometry = this.create_geometry_from_handles();
		
		var wireframe_geometry = new THREE.WireframeGeometry2( geometry );
		
		this.cage.wireframe.geometry = wireframe_geometry;
		
	},
	*/
	updateCage: function(){
		
		var geometry = this.create_geometry_from_handles();
		
		this.cage.wireframe.geometry.attributes.instanceEnd.data.array = geometry;
		this.cage.wireframe.geometry.attributes.instanceStart.data.array = geometry;
		
	},
	
	updateModel: function(){
		
		var cage_vertices = this.convert_vertices( this.cage.vertices );
		
		var new_mesh_vertices = this.backend.deformMVC( cage_vertices );
		
		this.convert_vertices_to_js(new_mesh_vertices);
		
		
		var geometry = this.update_geometry( this.mesh.vertices, this.mesh.faces );
		
		this.mesh.model.geometry.attributes.position.setArray( geometry );
		this.mesh.model.geometry.attributes.position.needsUpdate = true;
		
	},
	
	create_cage_handles: function() {
		
	
		var geometry = new THREE.SphereGeometry( 1, 32, 32 );
	
		for (var i=1; i<this.cage.vertices.length; i += 3)	{
			
			var material = new THREE.MeshLambertMaterial( {color: 0x0000ff} );
			var sphere = new THREE.Mesh( geometry, material );
			sphere.position.set ( this.cage.vertices[i-1], this.cage.vertices[i], this.cage.vertices[i+1]);
			this.cage.handles.push(sphere);
			this.viewer.scene.add(sphere);
		}
			
	},
	
	parse_geometry: function(data){
		
		var cords
		if(this.is_mesh){
			
			cords = data.slice(data.indexOf("\nv "), data.indexOf("\n", data.lastIndexOf("\nv ")+1 ));
			cords = cords.replace(/\nv/g, "");
			cords = cords.split(" ");
			cords.shift();
			this.mesh.vertices = cords.map(Number);
				
			cords = data.slice(data.indexOf("\nf "), data.indexOf("\n",  data.lastIndexOf("\nf ")+1 ));
			cords = cords.replace(/\nf/g, "");
			cords = cords.split(" ");
			cords.shift();
			this.mesh.faces = cords.map(Number);
			
		}
		else{
			
			cords = data.slice(data.indexOf("\nv "), data.indexOf("\n", data.lastIndexOf("\nv ")+1 ));
			cords = cords.replace(/\nv/g, "");
			cords = cords.split(" ");
			cords.shift();
			this.cage.vertices = cords.map(Number);
				
			cords = data.slice(data.indexOf("\nf "), data.indexOf("\n",  data.lastIndexOf("\nf ")+1 ));
			cords = cords.replace(/\nf/g, "");
			cords = cords.split(" ");
			cords.shift();
			this.cage.faces = cords.map(Number);
		}
	},
	
	set_wireframe_width: function(width) {
		
		this.mesh.wireframe.material.linewidth = width;
		
	},
	
	toggle_mesh_wireframe: function(){
			
		if(this.mesh.wireframe.visible){
			
			this.mesh.wireframe.visible = false;
			
		}
		else{

			this.mesh.wireframe.visible = true;
			
		}
	
	},
	
	set_wireframe_color: function(color) {
		
		var c = new THREE.Color(color);
		this.mesh.wireframe.material.color = c;
		
	},
	
	toggle_mesh_visibility: function(){
		
	
			
		if(this.mesh.model.visible) {
			
			this.mesh.model.visible = false;
			this.mesh.points.visible = false;
			
		}
		else{
			
			this.mesh.model.visible = true;
			this.mesh.points.visible = true;
			
		}
		
		
		
	},
	
	toggle_flat_shading: function( is_flat ){
		
		if( this.viewer.scene.getObjectById(this.mesh.model.id) ){
			
			this.mesh.model.material.flatShading = is_flat;
			this.mesh.model.material.needsUpdate = true;
			
		}else{
			
			this.viewer.scene.remove(this.mesh.points);
			this.viewer.scene.add(this.mesh.model);
			CageLab.UI.mesh.mesh_coluration.color_tris.prop('disabled', false);
			CageLab.UI.mesh.mesh_coluration.color_tris.prop('checked', true);
			CageLab.UI.mesh.mesh_coluration.set_tris_color.spectrum('enable');
			CageLab.UI.mesh.mesh_coluration.color_vertex.prop('disabled', true);
			CageLab.UI.mesh.mesh_coluration.set_vertex_color.spectrum('disable');
			
			this.mesh.model.material.flatShading = is_flat;
			this.mesh.model.material.needsUpdate = true;
		}
		
		
		
		
	},
	
	toggle_points: function(){
		
		this.viewer.scene.remove(this.mesh.model);
		this.viewer.scene.add(this.mesh.points);
		CageLab.UI.mesh.mesh_coluration.color_tris.prop('disabled', true);
		CageLab.UI.mesh.mesh_coluration.set_tris_color.spectrum('disable');
		CageLab.UI.mesh.mesh_coluration.color_vertex.prop('disabled', false);
		CageLab.UI.mesh.mesh_coluration.color_vertex.prop('checked', true);
		CageLab.UI.mesh.mesh_coluration.set_vertex_color.spectrum('enable');
			
			
		
	},
	
	set_mesh_color: function(color) {
		
		var c = new THREE.Color(color);
		this.mesh.model.material.color = c;
		
	},
	
	set_vertex_color: function(color) {
		
		var c = new THREE.Color(color);
		this.mesh.points.material.color = c;
		
	},
	
	toggle_cage: function(){
		
		if(this.cage.wireframe.visible){
			
			this.cage.wireframe.visible = false;
			this.cage.handles.map(function(handle){
			
			handle.visible = false;
			
			})
			
		}
		else {
			
			this.cage.wireframe.visible = true;
			this.cage.handles.map(function(handle){
			
				handle.visible = true;
			
			})	
		}
		
		
	},
	
	set_cage_color: function(color) {
		
		var c = new THREE.Color(color);
		this.cage.wireframe.material.color = c;
		
	},
	
	set_background_color: function(color) {
		
		this.viewer.renderer.setClearColor( color, 1.0 );
		
	},
	
	set_handlse_size: function(size) {
		
		
		this.cage.handles.map(function(object){
			
			object.scale.set(size, size, size);
			
		})
			
		
	},
	
	export_data: function(vertices, faces){
		
		var output = [];
		
		output += "####\n";
		
		output += "#Exported with CageLab";
		//output += "\n";
		
		output += "\n####";
		
		for(var i=0; i<vertices.length; i+= 3){
		
			
			var x = vertices[i];
			var y = vertices[i+1];
			var z = vertices[i+2];
			output += "\nv " + x + " " + y + " " + z;
			
		}
		
		output += "\n";
		
		for(var i = 0, n = faces.length; i < n; i += 3) {
			
			var a = faces[i];
			var b = faces[i+1];
			var c = faces[i+2];
			
            output += "\nf " + a + " " + b + " " + c;
        }	
		
		return output;
	},
	
	save_mesh: function( is_mesh ) {
		
		var text;
		var name;
		
		if(is_mesh){
			
			text = this.export_data( this.mesh.vertices, this.mesh.faces );
			name = this.mesh.name;
		
		}else  {
			
			text = this.export_data( this.cage.vertices, this.cage.faces );
			name = this.cage.name;
		}
		
		var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
		saveAs(blob, name);
		
	},
	
	compute_coords: function(){
		
		var mesh_vertices, mesh_faces, cage_vertices, cage_faces;
		
		mesh_vertices = this.convert_vertices( this.mesh.vertices );
		mesh_faces = this.convert_faces( this.mesh.faces );
		cage_vertices = this.convert_vertices( this.cage.vertices );
		cage_faces = this.convert_faces( this.cage.faces );
		
		var res = this.backend.compute_coords(mesh_vertices , mesh_faces, cage_vertices, cage_faces);
		
		console.log(res)
		
	},
	
	convert_vertices: function( vertices ){
		
		var tmp = new Module.vector$double$();
		

		for ( var i = 0, n = vertices.length; i < n; i++){
			
			tmp.push_back( vertices[i] );
			
		}
		
		return tmp;

	},
	
	convert_vertices_to_js: function( vertices ){
	
		for ( var i = 0, n = vertices.size(); i < n; i++){
			
			this.mesh.vertices[i] = vertices.get(i);
			
		}
		

	},
	
	convert_faces: function( faces ){
		
		var tmp = new Module.vector$int$();
		

		for ( var i = 0, n = faces.length; i < n; i++){
			
			tmp.push_back( faces[i]-1 );
			
		}
		
		return tmp;

	},
	
	
	animate: function() {
		
		this.controls.update();
		if( this.controls.needs_update && this.controls.moveHandles ){	
			this.updateCage();
		//	this.updateModel();
		}
			
		this.viewer.render_scene();
			
		
		requestAnimationFrame(this.animate.bind(this));
		
	}
	
})