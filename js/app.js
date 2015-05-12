(function (){

	var app = angular.module('angularmaps',[])

	.controller('mapsController', function($scope){
		var directionsDisplay;
		var directionsService = new google.maps.DirectionsService();
		var map;
		var tsp ;
		$scope.start="";
		$scope.stop="";
		$scope.centercity="";
		$scope.chicago="";
		$scope.origin="";
		$scope.destination=""; 
		$scope.waypoints=[];
		$scope.markers=[];
		$scope.bogota="";
		$scope.cali="";
		$scope.cartagena="";
		$scope.medellin="";
		$scope.cities=[];
		$scope.mymode="";
		$scope.modes;
		$scope.sendMode="";
		$scope.distance=0;
		$scope.initialize = function () {
		  directionsDisplay = new google.maps.DirectionsRenderer();
			$scope.chicago = { 
				name: "Chicago",
				coords: new google.maps.LatLng(41.850033, -87.6500523)
			};
			$scope.bogota={ 
				name: "Bogotá D.C.",
				coords: new google.maps.LatLng(4.6486475, -74.0860243)
			};
			//$scope.cities.push($scope.bogota);
			$scope.cali={ 
				name: "Cali",
				coords: new google.maps.LatLng(3.431996, -76.531794)
			};
			$scope.cartagena={ 
				name: "Cartagena",
				coords: new google.maps.LatLng(10.3697782, -75.4964606)
			};
			$scope.medellin={ 
				name: "Medellín",
				coords: new google.maps.LatLng(6.2520924, -75.5599862)
			};
			$scope.modes=[
				{name: "Drive",
				value: "DRIVING"},
				{name: "Walking",
				value: "WALKING"},
				{name: "Bicycling",
				value: "BICYCLING"},
				{name: "Transit",
				value: "TRANSIT"}

			];
			$scope.setMode ($scope.modes[0].value);
			//console.log($scope.modes[0].value);
			
			$scope.cities=[$scope.bogota,$scope.cali,$scope.cartagena,$scope.medellin,$scope.chicago];
			$scope.$apply();
		  	$scope.start=$scope.chicago;
			$scope.stop=$scope.chicago;
		  var mapOptions = {
		  	heading: 180,
		    zoom:12,
		    center: $scope.bogota.coords
		  };
		  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
			//panel de direcions revisar
			tsp = new BpTspSolver(map, document.getElementById("directionsPanel"));
		  	tsp.setAvoidHighways(false);
			tsp.setTravelMode(google.maps.DirectionsTravelMode.DRIVING);
			//fin tsp
		  directionsDisplay.setMap(map);
		  directionsDisplay.setPanel(document.getElementById("directionsPanel"));
		  google.maps.event.addListener(map, 'click', function(event) {
			  if ($scope.waypoints.length < 100) {
	          $scope.waypoints.push({ location: event.latLng, stopover: true });
	          //$scope.destination = event.latLng;
	          addMarker( event.latLng);
	        } else {
	          alert("Maximum number of waypoints reached");
	        }
			/*		  
	      if ($scope.origin == "") {
	        $scope.origin = event.latLng;
	        addMarker($scope.origin);
	      } else if ($scope.destination == "") {
	        $scope.destination = event.latLng;
	        addMarker($scope.destination);
	      } else {			  
	        if ($scope.waypoints.length < 100) {
	          $scope.waypoints.push({ location: $scope.destination, stopover: true });
	          $scope.destination = event.latLng;
	          addMarker($scope.destination);
	        } else {
	          alert("Maximum number of waypoints reached");
	        }
	      }
	    	*/
			
			});

		  function addMarker(latlng) {
		    $scope.markers.push(new google.maps.Marker({
		      position: latlng, 
		      map: map,
		      icon: "http://maps.google.com/mapfiles/marker" + String.fromCharCode($scope.markers.length + 65) + ".png"
		    }));
			//tsp
			tsp.addWaypoint(latlng,function (params) {
				console.log("Waypoint: "+ latlng);
			});
			//
			
			
		  }
		


		}
		$scope.click = function() {
        $scope.boolChangeClass = !$scope.boolChangeClass;
        $scope.$apply();
    }
		
  		$scope.rotate90= function() {
			  ///var heading = map.getHeading() || 0;
			  //map.setHeading(heading + 90);
			  map.setHeading(map.getHeading() + 90);
			}

		$scope.setMode= function(mode){

			$scope.sendMode=mode;
		};
		
		$scope.calcRoute = function () {
			var iterations= Math.ceil($scope.waypoints.length/10);
			var order=new Array();
			//tsp
		  
		  	tsp.solveAtoZ(function (params) {
			  createPolyline(tsp.getGDirections());			  
			  console.log("En orden");
			 console.log(tsp.getOrder());
			 order=tsp.getOrder();
			 var tempwaypoints= new Array();
			for (var index = 0; index < order.length; index++) {
				
				 tempwaypoints.push($scope.waypoints[order[index]]);
				
			}		
			 	 console.log("wayponits");
				  console.log($scope.waypoints);
				  console.log("tempway");
				 console.log(tempwaypoints);
			 for (var numrequest = 0; numrequest < iterations; numrequest++) {
				 
				 
				  var temp=new Array();
				  var end=(numrequest+1)*10;
				  var start=end-10;
				  temp= tempwaypoints.slice(start,end);
				  var temporigin=tempwaypoints[0].location;
				  
				  var tempdestination=tempwaypoints[tempwaypoints.length-1].location;
				  var tempstops=tempwaypoints.slice(1,tempwaypoints.length-1);
				  
				  console.log("el origen: ");
				  console.log(temporigin);
				  
				  console.log("el destion: ");
				  console.log(tempdestination);
				  console.log("el stops: ");
				  console.log(tempstops);
				  
				  $scope.request = {
			      origin:	temporigin,
			      destination:tempdestination,
			      
			      travelMode: google.maps.TravelMode[$scope.sendMode],
			      waypoints: tempstops,
			      optimizeWaypoints: true
	
			      
			  		};
				  directionsService.route($scope.request, function(response, status) {
				    if (status == google.maps.DirectionsStatus.OK) {
				      directionsDisplay.setDirections(response);
				      console.log(response);
				      console.log(response.routes[0].legs[0].distance.value);
				      $scope.getDistance(response.routes[0].legs);
				    }
				  });
				  
				  
			  }
			 
			 
			 
			 
		  	});
			
					  
		  
		
		  $scope.clearMarkers ();
		}
		
		
		$scope.calcRoute2 = function () {
		  //var start = document.getElementById('start').value;
		  //var end = document.getElementById('end').value;
		  //console.log($scope.waypoints);
		  //console.log("stop: "+ $scope.stop);
		 
		  $scope.request = {
		      origin:$scope.origin,
		      destination:$scope.destination,
		      //origin:"chicago, il",
		      //destination:"oklahoma city, ok",
		      //origin:$scope.start,
		      //destination:$scope.stop,
		      //travelMode: google.maps.TravelMode.DRIVING,
		      travelMode: google.maps.TravelMode[$scope.sendMode],
		      waypoints: $scope.waypoints,
		      optimizeWaypoints: true

		      
		  };
		  //console.log("request.origin: "+ $scope.request.origin);
		  //console.log("request.destina: "+ $scope.request.destination);
		  
		  directionsService.route($scope.request, function(response, status) {
		    if (status == google.maps.DirectionsStatus.OK) {
		      directionsDisplay.setDirections(response);
		      console.log(response);
		      console.log(response.routes[0].legs[0].distance.value);
		      $scope.getDistance(response.routes[0].legs);
		    }
		  });
		  
		  //directionsDisplay.setDirections(tsp.getGDirections());
		  
		   //tsp
		  
		  tsp.solveAtoZ(function (params) {
			  createPolyline(tsp.getGDirections());
			  
			   console.log("En orden");
			  console.log(tsp.getOrder());
		  });
		  //
		  $scope.clearMarkers ();
		}

		 $scope.clearMarkers = function () {
		    for (var i = 0; i < $scope.markers.length; i++) {
		      $scope.markers[i].setMap(null);
		    }
		  };
		  $scope.setCenter = function (center) {
		    map.setCenter(center);

		    
		  };
		  $scope.getDistance= function(values){
		  	var temp=0;
		  	angular.forEach(values, function(value, key) {
			  temp=temp+value.distance.value;
			});
		  	$scope.distance=temp/1000;
		  	$scope.$apply();
		  }
		   $scope.clearWaypoints = function() {
		    
		    $scope.origin="";
			$scope.destination="";  
			$scope.waypoints=[];
			$scope.markers=[];
		    directionsVisible = false;
		  }
		  $scope.reset = function(){
		  	$scope.clearMarkers ();		  
		   $scope.boolChangeClass = false;
		   $scope.distance=0;
		    $scope.clearWaypoints();
			
		    directionsDisplay.setMap(null);
		    directionsDisplay.setPanel(null);
		    directionsDisplay = new google.maps.DirectionsRenderer();
		    directionsDisplay.setMap(map);
		    directionsDisplay.setPanel(document.getElementById("map-canvas"));    
  			directionsDisplay.setPanel(document.getElementById("directionsPanel"));
			    
		  };
		  
		  
		  function createPolyline(directionResult) {
			  var line = new google.maps.Polyline({
			      path: directionResult.routes[0].overview_path,
			      strokeColor: '#FF0000',
			      strokeOpacity: 0.5,
			      strokeWeight: 4
			  });
			
			  line.setMap(map);
			
			  for (var i = 0; i < line.getPath().length; i++) {
			      var marker = new google.maps.Marker({
			          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 3 },  
			          position: line.getPath().getAt(i),
			          map: map
			      });
			  }
			}

		google.maps.event.addDomListener(window, 'load', $scope.initialize);

	})


})();


