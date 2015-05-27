(function (){

	var app = angular.module('angularmaps',['ngSanitize'])
	
	.config(function($sceDelegateProvider,$compileProvider) {
		//$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|local|data|ftp|file):/);

		$sceDelegateProvider.resourceUrlWhitelist([
		    // Allow same origin resource loads.
		    'self',
		    // Allow loading from our assets domain.  Notice the difference between * and **.
		    'https://maps.googleapis.com/maps/api/**',
			'https://*.google.com/**',
			'https://*.gstatic.com/**'
	  	]);
		  
		  })
		  
	.controller('mapsController', function($scope,$http,$q,$timeout){
		var directionsDisplay;
		var directionsService = new google.maps.DirectionsService();
		var map;
		var tsp ;
		var combinedResults	=	new Array();
		var polylines	=	new Array();
		var aditionalmarkers = new Array();
		var rendererOptions = {
			preserveViewport: true,         
			//suppressMarkers:true,
			//routeIndex:0
			};

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
		$scope.time=0;
		$scope.calcBool=false;
		$scope.initialize = function () {
		  directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
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
		  	//heading: 180,
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
			  if ($scope.waypoints.length < 28) {
	          $scope.waypoints.push({ location: event.latLng, stopover: true });
	          //$scope.destination = event.latLng;
	          addMarker( event.latLng);
	        } else {
	          alert("Número máximo de puntos alcanzado!!");
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
			var color="";
			var ascii=65;
			if ($scope.markers.length>25 ){color="_green"; ascii=39;};
		    $scope.markers.push(new google.maps.Marker({
		      position: latlng, 
		      map: map,
			      icon: "http://maps.google.com/mapfiles/marker"+ color + String.fromCharCode($scope.markers.length + ascii) + ".png"
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
        //$scope.$apply();
    };
		
  		$scope.rotate90= function() {
			  ///var heading = map.getHeading() || 0;
			  //map.setHeading(heading + 90);
			  map.setHeading(map.getHeading() + 90);
			}

		$scope.setMode= function(mode){

			$scope.sendMode=mode;
		};

		$scope.calcRoute = function () {
			$scope.calcBool = true;
			var timeoutcount=-1;
			var requestarray= new Array();
			var iterations= 1;
			if($scope.waypoints.length<=10)iterations=1;
			else if(10<$scope.waypoints.length && $scope.waypoints.length<20)iterations=2;
			else if(20<=$scope.waypoints.length && $scope.waypoints.length<29)iterations=3;
			else iterations= Math.ceil($scope.waypoints.length/10);
			var order=new Array();
			//tsp
		  
		  	tsp.solveAtoZ(function (params) {
			  createPolyline(tsp.getGDirections());			  
			  //console.log("En orden");
			 //console.log(tsp.getOrder());
			 order=tsp.getOrder();
				$scope.clearMarkers ();
			 console.log("Duaracione algoritmo");
			 console.log(tsp.getDurations());
			 var tempwaypoints= new Array();
			for (var index = 0; index < order.length; index++) {
				
				 tempwaypoints.push($scope.waypoints[order[index]]);
				
			}		
			 
			 for (var numrequest = 0; numrequest < iterations; numrequest++) {
				 
				var temprequest=numrequest;
				
				 //console.log("Para mirar el error mirar el request, el numrequest:"+ numrequest);
				  var temp=new Array();
				  var temprequest=numrequest;
				  var end=((temprequest+1)*9)+1;				  
				  var start=end-10;
				  temp.push(tempwaypoints.slice(start,end));				  
				  var temporigin=temp[0][0].location;
				  var tempdestination=temp[0][temp[0].length-1].location;
				  var tempstops=temp[0].slice(1,temp[0].length-1);
				  
				  var request = {
					      origin:	temporigin,
					      destination:tempdestination,					      
					      travelMode: google.maps.TravelMode[$scope.sendMode],
					      waypoints: tempstops,
					      optimizeWaypoints: true
			
			      
			  		};
					requestarray.push(request);
				
				console.log("Para mirar el error mirar el request, el numrequest:");
				console.log(temprequest);
				//temprequest=numrequest;
				$timeout( function () {
				timeoutcount=timeoutcount+1;
				var deferred = $q.defer();	 
				var	directionsServicetemp = new google.maps.DirectionsService();
					  directionsServicetemp.route(requestarray[timeoutcount], function(response, status) {
						  	//console.log("Para mirar el request dentro del route:");	
							//console.log(request);
			
						  
					    if (status == google.maps.DirectionsStatus.OK) {
							
						deferred.resolve(response);
						combinedResults.push(deferred.promise);
							
						 //console.log("combinedResults:");
						 //console.log(combinedResults);
						
						   combinedResults[combinedResults.length-1].then(function (data) {
						
							   createBluePolyline(data);
							   //console.log(combinedResults);
							   $scope.getDistanceTime(data.routes[0].legs);
							   //console.log(" longitud array promesas");
							  //console.log(combinedResults.length);
							  
								
								   
							 });
				  				
					    }//direction status
					  }
					  )
					
										
				  }, ((temprequest+1)*2000)-2000 );	
				  //temprequest=numrequest;
				  
			  }
			
			 
		  	});
					  
		  
		};



		 $scope.clearMarkers = function () {
		    for (var i = 0; i < $scope.markers.length; i++) {
		      $scope.markers[i].setMap(null);
		    }
		  };
		  $scope.setCenter = function (center) {
		    map.setCenter(center);

		    
		  };
		  $scope.getDistanceTime= function(values){
		  	var tempdistance=0;
			var temptime=0;
		  	angular.forEach(values, function(value, key) {
			  tempdistance=tempdistance+value.distance.value;
			  temptime=temptime+value.duration.value;
			  
			});
		  	$scope.distance=(tempdistance/1000) + $scope.distance ;
			$scope.time=(temptime/60) + $scope.time ;
		  	//$scope.$apply();
		  };
		   $scope.clearWaypoints = function() {
		    
		    $scope.origin="";
			$scope.destination="";  
			$scope.waypoints=[];
			$scope.markers=[];
		    directionsVisible = false;
		  };
		  $scope.reset = function(){
		  	$scope.clearMarkers ();		  
		   $scope.boolChangeClass = false;
		   $scope.distance=0;
		    $scope.clearWaypoints();
			$scope.calcBool=false;
		    directionsDisplay.setMap(null);
		    directionsDisplay.setPanel(null);
		    directionsDisplay = new google.maps.DirectionsRenderer();
		    directionsDisplay.setMap(map);
		    directionsDisplay.setPanel(document.getElementById("map-canvas"));    
  			directionsDisplay.setPanel(document.getElementById("directionsPanel"));
			deleteBluePolyline();
			deleteAditionalmarkers();
			combinedResults	=	new Array();
			//tsp=null;
			//delete tsp;
			tsp.startOver();
		  	tsp.setAvoidHighways(false);
			tsp.setTravelMode(google.maps.DirectionsTravelMode.DRIVING);
			
			$scope.distance=0;
			$scope.time=0;    
		  };
		  
		  
		  function createPolyline(directionResult) {
			  var line = new google.maps.Polyline({
			      path: directionResult.routes[0].overview_path,
			      strokeColor: '#FF0000',
			      strokeOpacity: 0.5,
			      strokeWeight: 2
			  });
			
			  line.setMap(map);
			  polylines.push(line);
			
			  for (var i = 0; i < line.getPath().length; i++) {
			      var marker = new google.maps.Marker({
			          icon: { path: google.maps.SymbolPath.CIRCLE, scale: 3 },  
			          position: line.getPath().getAt(i),
			          map: map
			      });
				  aditionalmarkers.push(marker);
			  }
			}
			function deleteBluePolyline() {
				angular.forEach(polylines, function(value, key) {
					//console.log(value);
			  		value.setMap(null);
			  
			});
			polylines= new Array();
			};
			
			function deleteAditionalmarkers() {
				angular.forEach(aditionalmarkers, function(value, key) {
					//console.log(value);
			  		value.setMap(null);
			  
			});
			aditionalmarkers= new Array();
			};
			function createBluePolyline(directionResult) {
			  var line = new google.maps.Polyline({
			      path: directionResult.routes[0].overview_path,
			      strokeColor: '#3300FF', 
			      strokeOpacity: 0.5,
			      strokeWeight: 6
			  });
				console.log(line);
			  	line.setMap(map);
  				//console.log(line);
				polylines.push(line);
			/*
			  for (var i = 0; i < line.getPath().length; i++) {
			      var marker = new google.maps.Marker({
			          icon: {
						   //path: google.maps.SymbolPath.CIRCLE, scale: 3 
						   
						   },  
			          position: line.getPath().getAt(i),
			          map: map
			      });
			  }
			  */
			}


		google.maps.event.addDomListener(window, 'load', $scope.initialize);

	});


})();


