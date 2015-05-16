var port = "8081";
var host = "http://10.0.0.9:" + port;
var apiKey = "46abdc48319c66c67962883b06ec7f74";

setInterval(refresh, 60000*15);    //60,000 milliseconds * 15

function refresh(){
	checkForService();
}

function clearFields(){
	$("#log").html("");
	$("#history").html("");
	$("#upcoming").html("");
}

function changeSettings(){ //@TODO
	return; 
}

function checkForService(){
	$.ajax({
		type: "GET",
		url: host + "/api/" + apiKey + "/?cmd=sb.ping",
		dataType: "jsonp",
		error: function(){
			$("#log").append("Could not access SickBeard. Have you entered correct settings, and checked that it's running on your server?");
		},
		success: function(data){
			clearFields(); 
			getHistory();
			getUpcoming(); 
		}
	})
}

function getHistory(){ // Cotacts SickBeard and gets the latest downladed episodes.
	var log = $("#log");
	$.ajax({
		type: "GET",
		url: host + "/api/" + apiKey + "/?cmd=history&type=downloaded&limit=50",
		data: String,
		dataType: "jsonp", 
		error: function(){
			log.append("Something is wrong, we can't get the history of downloaded episodes.");
		},
		success: function(data){
			presentHistory(data); 
		}
	})
}

function getUpcoming(){ // Cotacts SickBeard and gets the upcoming episodes.
	var log = $("#log");
	$.ajax({
		type: "GET",
		url: host + "/api/" + apiKey + "/?cmd=future&sort=date",
		data: String,
		dataType: "jsonp", 
		error: function(){
			log.append("Something is wrong, we can't get the upcoming episodes.");
		},
		success: function(data){
			presentUpcoming(data); 
		}
	});
}

function presentUpcoming(data){ // Presents the upcoming-data
	var loc = $("#upcoming"); 
	var eps  = [data.data.today, data.data.soon, data.data.later];
	for (var time = 0; time < eps.length; time++){
		var episodes = eps[time]; 
		for (var i = 0; i < episodes.length; i++){
			var ep = episodes[i];
			loc.append(ep.show_name+ " - " + ep.airdate + " - " + ep.season + " x " + ep.episode +"<br>"); 
		}
	}
}

function checkOff(){ // Check out an episode 
	// @TODO: Also allow unchecking if already checked.
	$(event.target).css('text-decoration', 'line-through');
	// @TODO: Implement some logic for remembering that this episode has been checked.
}

function getFilePath(episode){ 
	var id = getTVDBID(episode.show_name); 
	$.ajax({
		type: "GET", 
		url: host + "/api/" + apiKey + "?cmd=episode&tvdbid="+ id+"&season="+episode.season.toString() +"&episode="+ episode.episode.toString()+ "&full_path=1",
		data: String,
		dataType: "jsonp", 
		success: function(data){
			console.log(data.data["location"]); 
		}
	});
	return ""; 
}

function getTVDBID(showName){
	$.ajax({
		type: "GET", 
		url: host + "/api/" + apiKey + "/?cmd=shows&sort=name",
		dataType: "jsonp", 
		error: function(){
			$("#log").append("Could not get TVDBID for the show " + showName);
		},
		success: function(data){
			var shows = data.data; 
			for (show in shows){
				if (shows[show].show_name == showName){
					return shows.show.tvdbid; 
				}
			}
		}
	});
}

function presentHistory(data){ // Presents the history-data
	var loc = $("#history");
	var episodes = data.data; 
	var addedEpisodes = new Array(); // Holds the added episodes, so we can check if a download is just a new version.
	for (var i = 0; i < episodes.length; i++){
		var ep = episodes[i];
		if ( addedEpisodes.indexOf(ep.show_name+ep.season+ep.episode) != -1) {
			continue; 
		}
		getStatus(ep); 
		addedEpisodes.push(ep.show_name+ep.season+ep.episode);
	}
}

function getStatus(episodeData){ 
	// Gets the shows status
	$.ajax({
		type: "GET", 
		url: host + "/api/" + apiKey + "?cmd=show&tvdbid=" + episodeData.tvdbid.toString(),
		data: String,
		dataType: "jsonp", 
        error: function(){
        	$("#log").append("Method isToBeShown failed for " + tvdbid.toString());
        },
		success: function(data){
			checkStatus(data, episodeData);
		}
	});
}

function checkStatus(showData, episodeData){
	if (showData.data.status != "Ended"){ // If it's not a running show, this episode is backlog-download.
		addToView(episodeData)
	}
}

function addToView(ep){
	var loc = $("#history");
	var btn = "<a href='"+getFilePath(ep)+"'<span class='glyphicon glyphicon-play'></span>"; // Needs padding.
	loc.append( btn + "<a onClick='checkOff()' >"+ ep.show_name + " - " + ep.season + " x " + ep.episode +"</a><br>"); 
}