//This is the only global variable and it will be an instance of ClientBrain class
var brain

$(document).ready(function(){

	var socketio = io.connect('http://' + document.domain + ':' + location.port)

	//var map = new Map("MST Campus", 37.955879, -91.775020, 20, 640, 640, '/static/Images/Map\ Images/MSTStaticMap20zoom.png')

	var map = new Map("Football Pitch", 37.924750,-91.772437, 19, 640, 640, '/static/Images/Map\ Images/FootballPitchZoom19.png')

	brain = new ClientBrain(socketio, map)

	getDronesInfoFromServer()
})

function getDronesInfoFromServer(){

	//this function sends a request to server to obtain all the drones
	//available in the system and set the drones array in brain.drones
	$.ajax({
		type: 'GET',
		url: '/getDrones',
		contentType: 'application/json',
		success: function(drones){
			drones = drones['results']
			
			for(index in drones){
				
				brain.drones.push(new Drone(drones[index]))
			}
			
			brain.initialGraphicSettings()
			
		},
		error: function(){
			$('h1').remove()
			alert("Something went wrong.. check your wifi conncetion, you have to be connected with Solo WiFi")
		}
	})
}

//this function is called when user clicks on "Connect" button 
//in each row of drones table.
function connectDrone(droneName){
	
	console.log(droneName)

	$("[id ='" + droneName + "']").children().eq(1).html("Trying to connect...")
	$("[id ='" + droneName + "']").children().eq(2).children().eq(0).attr("disabled", "true")
	
	$.ajax({
		type: 'POST',
		url: '/connectDrone',
		contentType: 'application/json',
		data: JSON.stringify({ droneName: droneName}),
		success: function(message){
			
			if (message == droneName + " netwotk is not reacheble") {
				alert(message)
				$("[id ='" + droneName + "']").children().eq(1).html("Not connected(previous error)")
				$("[id ='" + droneName + "']").children().eq(2).children().eq(0).removeAttr("disabled")
	
			} else{
				
				var element = brain.getIndexDrone(droneName)
				var flightButton = '<button type="button" class="btn btn-success" onclick="flightDrone(\'' +  brain.drones[element].name + '\')">Flight</button>' 
	
				$("[id = '" + droneName + "']").children().eq(1).html("Connected")
				$("[id = '" + droneName + "']").children().eq(2).html(flightButton)

				var location = brain.converter.getXYCoordinatesFromLatitudeLongitudeCoordinates(parseFloat(message.latitude), parseFloat(message.longitude))
				brain.graphicBrain.addMarker(location.x, location.y, 'home', droneName) 
				brain.graphicBrain.addLocationIntoTableOfLocationsToReach(droneName, brain.drones, message.latitude, message.longitude, 0)
			}
		},
		error: function(){
			
			alert("Something went wrong.. check your wifi conncetion, you have to be connected with Solo WiFi")
		}
	})
}



