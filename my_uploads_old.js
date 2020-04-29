// Define some variables used to remember state.
var playlistId, nextPageToken, prevPageToken;

// After the API loads, call a function to get the uploads playlist ID.
function handleAPILoaded() {
  requestUserPlaylists();
}

// Call the Data API to retrieve the playlist ID that uniquely identifies the
// list of videos uploaded to the currently authenticated user's channel.
function requestUserPlaylists() {
  var request = gapi.client.youtube.playlists.list({
    mine: true,
    part: 'snippet',
    maxResults: 50
  });
  request.execute(function(response) {
    for(var x = 0; x < response.items.length; x++) {
      var pl = document.createElement("IMG");
      pl.setAttribute("id", "" + x);
      pl.setAttribute("src", response.items[x].snippet.thumbnails.high.url);
      pl.setAttribute("height", "" + response.items[x].snippet.thumbnails.high.height);
      pl.setAttribute("weidth", "" + response.items[x].snippet.thumbnails.high.width);
      pl.setAttribute("alt", response.items[x].snippet.title);
      document.body.appendChild(pl); //$('#video-container')
      document.getElementById("" + x).onclick = function(event) {
        playlistId = response.items[event.target.id].id;
        requestVideoIds(playlistId);
      };
    }
  });
}

// Retrieve the list of videos in the specified playlist.
function requestVideoIds(playlistId, pageToken) {
  $('#video-container').html('');
  var requestOptions = {
    playlistId: playlistId,
    part: 'snippet',
    maxResults: 10
  };
  if (pageToken) {
    requestOptions.pageToken = pageToken;
  }
  var request = gapi.client.youtube.playlistItems.list(requestOptions); 
  request.execute(function(response) {
    // Only show pagination buttons if there is a pagination token for the
    // next or previous page of results.
    nextPageToken = response.result.nextPageToken;
    var nextVis = nextPageToken ? 'visible' : 'hidden';
    $('#next-button').css('visibility', nextVis);
    prevPageToken = response.result.prevPageToken
    var prevVis = prevPageToken ? 'visible' : 'hidden';
    $('#prev-button').css('visibility', prevVis);

    var playlistItems = response.result.items;
    if (playlistItems) {
      $.each(playlistItems, function(index, item) {
        displayResult(item.snippet);
      });
    } else {
      $('#video-container').html('Sorry, this playlist has no videos');
    }
  });
}

// Create a listing for a video.
function displayResult(videoSnippet) {
  var title = videoSnippet.title;
  var videoId = videoSnippet.resourceId.videoId;
  $('#video-container').append('<p>' + title + ' - ' + videoId + '</p>');
}

// Retrieve the next page of videos in the playlist.
function nextPage() {
  requestVideoIds(playlistId, nextPageToken);
}

// Retrieve the previous page of videos in the playlist.
function previousPage() {
  requestVideoIds(playlistId, prevPageToken);
}