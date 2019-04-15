"use strict";

var CageLab = {}

CageLab.FS = {
	
	file_picker :  $('#file_picker'),
  
	getFile: function( event ){
		
		var reader = new FileReader()
		
		var name = this.files[0].name
		
		reader.readAsDataURL( this.files[0] )
			
			reader.onload = function (){
				
				CageLab.app.load_mesh( reader.result, name )
				
			}
    
	},
}

CageLab.UI = {
	
	display:                $('body'),
	
	left_sidebar: {
		
		camera_controls: 	$('#camera_controls'),
		select_handles: 	$('#select_handles'),
		unselect_handles: 	$('#unselect_handles'),
		move_handles: 		$('#move_handles'),
		sidebar_menu:		$('#interaction_mode_toolbar *'),
		
	},
	
	
	
	window_settings: {
		
		bg_color: 			$('#background_color'),
		fullscreen: 		$('#fullscreen_checkbox')
		
	},
	
	cage: {
		
		load_cage:				$('#load_cage'),
		save_cage:				$('#save_cage'),
		cage_menu:				$('#cage_settings *'),
			
		toggle_cage: 			$('#toggle_cage'),
		sphere_size_slider: 	$('#sphere_size_slider'),
		cage_wireframe_color:    $('#cage_wireframe_color'),
		
		coordinates: {
			
			compute_coords:		$('#compute_coords'),
			no_cords:			$('#no_cords'),
			mcv_cords:			$('#mcv_cords'),
			green_coords:		$('#green_coords'),
			
		},
		
		on_cage_load: function(){
			
			CageLab.UI.left_sidebar.sidebar_menu.prop('disabled', false)
			CageLab.UI.cage.cage_menu.prop('disabled', false)
			CageLab.UI.cage.toggle_cage.prop('checked', true)
			CageLab.UI.cage.sphere_size_slider.slider('enable')
			CageLab.UI.cage.cage_wireframe_color.spectrum('enable')
			CageLab.UI.cage.toggle_cage.prop('checked', true)
			CageLab.UI.cage.save_cage.prop('disabled', false)
			
			
		},
		
	},
	
	mesh: {
		
		load_mesh:			$('#load_mesh'),
		save_mesh:			$('#save_mesh'),
		mesh_menu:			$('#mesh_menu *'),
		
		mesh_rendering: {
			
			draw:			$('#draw_check'),
			points:			$('#draw_points'),
			flat:			$('#draw_flat'),
			smooth:			$('#draw_smooth')
			
		},
		
		mesh_coluration: {
			
			color_vertex:		$('#vertex_color'),
			color_tris:			$('#tris_color'),
			heat_map:			$('#heat_map'),
		
			set_vertex_color:	$('#set_vertex_color'),
			set_tris_color:		$('#set_tris_color'),
		
			
		},
		
		mesh_wireframe: {
			
			toggle_wireframe:	$("#toggle_wireframe"),
			wireframe_color:	$("#mesh_wireframe_color"),
			wireframe_width:	$("#wireframe_slider"),
			
		},
		
		on_mesh_load: function(){
			
			CageLab.UI.left_sidebar.camera_controls.prop('disabled', false)
			CageLab.UI.mesh.mesh_menu.prop('disabled', false)
			CageLab.UI.mesh.save_mesh.prop('disabled', false)
			CageLab.UI.mesh.mesh_coluration.set_tris_color.spectrum('enable')
			CageLab.UI.mesh.mesh_wireframe.wireframe_width.slider('enable')
			CageLab.UI.mesh.mesh_wireframe.wireframe_color.spectrum('enable')
			CageLab.UI.mesh.mesh_rendering.draw.prop('checked', true)
			CageLab.UI.mesh.mesh_rendering.smooth.prop('checked', true)
			CageLab.UI.mesh.mesh_coluration.color_tris.prop('checked', true)
			CageLab.UI.mesh.mesh_coluration.color_vertex.prop('disabled', true)
			CageLab.UI.mesh.mesh_coluration.heat_map.prop('disabled', true)
			
		},
	},
	
	
}

//TODO Link the correct function

CageLab.UI.window_settings.bg_color.spectrum({
	
	color: "#ffffff",
	
}).on('change.spectrum', function (color) {
	
	CageLab.app.set_background_color($(this).spectrum('get').toHexString())

})

CageLab.UI.mesh.mesh_coluration.set_vertex_color.spectrum({
		
	color: "#000000",

}).on('change.spectrum', function (color) {
	
	CageLab.app.set_vertex_color($(this).spectrum('get').toHexString())

})

CageLab.UI.mesh.mesh_coluration.set_tris_color.spectrum({
		
	color: "#00ff00",
	showInput: true,
	
}).on('change.spectrum', function (color) {
	
	CageLab.app.set_mesh_color($(this).spectrum('get').toHexString())

})

CageLab.UI.cage.cage_wireframe_color.spectrum({
		
	color: "#000000",
	
}).on('change.spectrum', function (color) {
	
	CageLab.app.set_cage_color($(this).spectrum('get').toHexString())

})

CageLab.UI.mesh.mesh_wireframe.wireframe_color.spectrum({
		
	color: "#000000",
	
}).on('change.spectrum', function (color) {
	
	CageLab.app.set_wireframe_color($(this).spectrum('get').toHexString())
	
})

CageLab.UI.cage.sphere_size_slider.slider({
    value: 0.25,
    min: 0,
    max: 2,
    step: 0.25
}).on('slide', function (e, ui) {
	
    CageLab.app.set_handlse_size(ui.value)
	
})

CageLab.UI.mesh.mesh_wireframe.wireframe_width.slider({
    value: 1,
    min: 0,
    max: 10,
    step: 1
}).on('slide', function (e, ui) {
	
    CageLab.app.set_wireframe_width(ui.value)
	
})

CageLab.UI.mesh.load_mesh.click(function (event) {
	
    event.preventDefault()
	CageLab.app.loader_selector(true)
	CageLab.FS.file_picker.trigger('click')
	
})

CageLab.UI.mesh.save_mesh.click(function (event) {
	
    event.preventDefault()
	CageLab.app.save_mesh(true)
	
})

CageLab.UI.cage.load_cage.click(function (event) {
	
    event.preventDefault()
	CageLab.app.loader_selector(false)
    CageLab.FS.file_picker.trigger('click')
	
})

CageLab.UI.cage.save_cage.click(function (event) {
	
    event.preventDefault()
	//CageLab.app.loader_selector(true)
	CageLab.app.save_mesh(false)
	
})

CageLab.UI.cage.coordinates.compute_coords.click(function (event) {
	
    event.preventDefault()
	//CageLab.app.loader_selector(true)
	CageLab.UI.cage.coordinates.no_cords.prop('checked', true)
	CageLab.app.compute_coords()
	CageLab.UI.cage.coordinates.compute_coords.prop('disabled', true)
	
})

CageLab.UI.window_settings.fullscreen.on('change', function(){
	
	
	if (document.body.requestFullscreen) {
    document.body.requestFullscreen();
  } else if (document.body.mozRequestFullScreen) { /* Firefox */
    document.body.mozRequestFullScreen();
  } else if (document.body.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    document.body.webkitRequestFullscreen();
  } else if (document.body.msRequestFullscreen) { /* IE/Edge */
    document.body.msRequestFullscreen();
  }
	
	if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen();
  }
	
	
})

CageLab.UI.mesh.mesh_rendering.draw.on('change', function(){
	
	CageLab.app.toggle_mesh_visibility()
	
})

CageLab.UI.mesh.mesh_rendering.points.on('change', function(){
	
	CageLab.app.toggle_points();
	
})

CageLab.UI.mesh.mesh_rendering.flat.on('change', function(){
	
	CageLab.app.toggle_flat_shading(true)
	
})

CageLab.UI.mesh.mesh_rendering.smooth.on('change', function(){
	
	CageLab.app.toggle_flat_shading(false)
	
})

CageLab.UI.mesh.mesh_coluration.color_vertex.on('change', function(){
	
	console.log("i am vertex")
	
})

CageLab.UI.mesh.mesh_coluration.color_tris.on('change', function(){
	
	console.log("i am tris")
	
})

CageLab.UI.mesh.mesh_coluration.heat_map.on('change', function(){
	
	console.log("i am heat map")
	
})

CageLab.UI.cage.coordinates.no_cords.on('change', function(){
	
	CageLab.app.barycentric_mode = CageLab.app.barycentric_coords.NONE;
	
})

CageLab.UI.cage.coordinates.mcv_cords.on('change', function(){
	
	CageLab.app.barycentric_mode = CageLab.app.barycentric_coords.MVC;

	
})

CageLab.UI.cage.coordinates.green_coords.on('change', function(){
	
	CageLab.app.barycentric_mode = CageLab.app.barycentric_coords.GREEN;

	
})


CageLab.UI.mesh.mesh_wireframe.toggle_wireframe.on('change', function(){
	
	CageLab.app.toggle_mesh_wireframe()
	
})

CageLab.UI.cage.toggle_cage.on('change', function(){
	
	CageLab.app.toggle_cage()
	
})

CageLab.UI.left_sidebar.camera_controls.on('change', function (event) {
	
    event.preventDefault()
	CageLab.app.interaction_toolbar_event($(this).val())
	
})

CageLab.UI.left_sidebar.select_handles.on('change', function (event) {
	
    event.preventDefault()
	CageLab.app.interaction_toolbar_event($(this).val())
	
})

CageLab.UI.left_sidebar.unselect_handles.on('change', function (event) {
	
    event.preventDefault()
	CageLab.app.interaction_toolbar_event($(this).val())
	
})

CageLab.UI.left_sidebar.move_handles.on('change', function (event) {
	
    event.preventDefault()
	CageLab.app.interaction_toolbar_event($(this).val())
	
})



document.getElementById('file_picker').addEventListener('change', CageLab.FS.getFile, false);



CageLab.UI.window_settings.fullscreen.prop('checked', false)
CageLab.UI.left_sidebar.sidebar_menu.prop('checked', false)
CageLab.UI.left_sidebar.sidebar_menu.prop('disabled', true)

CageLab.UI.mesh.mesh_menu.prop('checked', false)
CageLab.UI.mesh.mesh_menu.prop('disabled', true)
CageLab.UI.mesh.save_mesh.prop('disabled', true)
CageLab.UI.mesh.mesh_wireframe.wireframe_width.slider('disable')

CageLab.UI.mesh.mesh_coluration.set_vertex_color.spectrum('disable')
CageLab.UI.mesh.mesh_coluration.set_tris_color.spectrum('disable')
CageLab.UI.mesh.mesh_wireframe.wireframe_color.spectrum('disable')

CageLab.UI.cage.cage_menu.prop('disabled', true)
CageLab.UI.cage.save_cage.prop('disabled', true)
CageLab.UI.cage.toggle_cage.prop('checked', false)

CageLab.UI.cage.sphere_size_slider.slider('disable')
CageLab.UI.cage.cage_wireframe_color.spectrum('disable')

