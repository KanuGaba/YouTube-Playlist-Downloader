// Define some variables used to remember state.
var playlistId, nextPageToken, prevPageToken;
var idArray = [];
var linkArray = [];

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
      //var div = document.createElement("div");
      var pl = document.createElement("IMG");
      pl.setAttribute("id", "" + x);
      pl.setAttribute("src", response.items[x].snippet.thumbnails.high.url);
      pl.setAttribute("height", "" + response.items[x].snippet.thumbnails.high.height/1.5);
      pl.setAttribute("weidth", "" + response.items[x].snippet.thumbnails.high.width/1.5);
      pl.setAttribute("alt", response.items[x].snippet.title);
      pl.style.padding = "10px";
      document.body.appendChild(pl); //$('#video-container')
      //div.appendChild(pl);
      //div.innerHTML = response.items[x].snippet.title;
      document.getElementById("" + x).onclick = function(event) {
        idArray = [];
        linkArray = [];
        playlistId = response.items[event.target.id].id;
        requestVideoIds(playlistId);
        setTimeout(function() {
          for(var x = 0; x < linkArray.length; x++){
            // var win = window.open(linkArray[x], '_blank');
            // win.focus();
              window.open(linkArray[x]);
          }
        }, 5000);
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
    // var nextVis = nextPageToken ? 'visible' : 'hidden';
    // $('#next-button').css('visibility', nextVis);
    // prevPageToken = response.result.prevPageToken
    // var prevVis = prevPageToken ? 'visible' : 'hidden';
    // $('#prev-button').css('visibility', prevVis);

    var playlistItems = response.result.items;
    if (playlistItems) {
      $.each(playlistItems, function(index, item) {
        // displayResult(item.snippet);
        idArray.push(item.snippet.resourceId.videoId);
        //console.log(idArray);
      });
    } else {
      $('#video-container').html('Sorry, this playlist has no videos');
    }

    if(response.result.nextPageToken) {
      requestVideoIds(playlistId, nextPageToken);
    }
    else{
      console.log(idArray);
      for(var x = 0; x < idArray.length; x++) {
        downloadMP3(idArray[x]);
      }
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

function downloadMP3(id) {
  $.ajax(
  {
    url:"/~2017kgaba/Lab%206/toMP3.php",
    data:{
      id:id
    },
    success:function(result){ 
      linkArray.push(JSON.parse(result).link);
      console.log(linkArray);
    }
  })
}

function download_files(files) {
    function download_next(i) {
        if(i >= files.length) {
            return;
        }
        var a = document.createElement('a');
        a.href = files[i].download;
        a.target = '_parent';
        // Use a.download if available, it prevents plugins from opening.
        if ('download' in a) {
            a.download = files[i].filename;
        }
        // Add a to the doc for click to work.
        (document.body || document.documentElement).appendChild(a);
        if (a.click) {
            a.click(); // The click method is supported by most browsers.
        } else {
            $(a).click(); // Backup using jquery
        }
        // Delete the temporary link.
        a.parentNode.removeChild(a);
        // Download the next file with a small timeout. The timeout is necessary
        // for IE, which will otherwise only download the first file.
        setTimeout(function () { download_next(i + 1); }, 500);
    }
    // Initiate the first download.
    download_next(0);
}