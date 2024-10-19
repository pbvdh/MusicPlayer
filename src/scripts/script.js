let song; //global variable to hold song that is currently playing, if any.
let queue = []; //global variable to hold the current queue


//EVENT LISTENERS AND DYNAMIC GENERATION
async function init() {

  /*Generate HTML that needs to be created before event listeners are added */
  let songList = document.getElementById("songlist");
  let listItems = await loadSongList(songList);
  songList.innerHTML = listItems;

  /*event listeners for DOM*/
  let songSearchLinks = document.querySelectorAll(".songsearchlink");
  let togglePanes = document.getElementById("nowplayingimage");
  let clearSongSearch = document.getElementById("searchsongsclearbutton");
  let songSearchInput = document.getElementById("searchsongs");
  let trackSlider = document.getElementById("trackslider");
  let playbackDurationField = document.getElementById("playbackduration");
  let actionbuttons = document.querySelectorAll(".actionbutton");
  let actionmenuoptions = document.querySelectorAll(".actionmenuoption");
  let queueList = document.getElementById("queuelist");
  let songNames = document.querySelectorAll(".songname");
  let playButton = document.getElementById("playbutton");
  let muteButton = document.getElementById("mutebutton");
  let volumeSlider = document.getElementById("volumeslider");

  //handle a song getting dragged within the song queue
  queueList.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(queuelist, e.clientY);
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
      queueList.appendChild(draggable);
    } else {
      queueList.insertBefore(draggable, afterElement);
    }
  });

  //if an the name of an artist is clicked within our app, we input it as a search
  songSearchLinks.forEach(songSearchLink => {
    songSearchLink.addEventListener('click', () => {
      searchLinkedTrack(songSearchLink, songList, songSearchInput, clearSongSearch);
    });
  });

  //if the now playing image is clicked, toggle display
  togglePanes.addEventListener('click', function() {
    showHidePanes();
  });

  //clear search window button
  clearSongSearch.addEventListener('click', function() {
    clearInput(songList, songSearchInput, clearSongSearch);
  });

  //handle searching for songs
  songSearchInput.addEventListener('input', function() {
    searchSongByName(songList, songSearchInput, clearSongSearch);
  });

  //update the current position value for the track slider
  trackSlider.addEventListener('input', function() {
    updatePlaybackPositionValue(trackSlider);
    song.currentTime = trackSlider.value;
  });

  //pop up options menus on song panels
  actionbuttons.forEach(actionbutton => {
    const dropdown = actionbutton.parentElement.querySelector('.actionmenudropdown');
    actionbutton.addEventListener('click', (event) => {
      removeOpenDropDowns(event); //clear existing pop ups if there are any
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      dropdown.setAttribute("id", "active-action-menu-dropdown"); //identifier with which to remove open drop downs
    });
  });

  actionmenuoptions.forEach(option => {
    option.addEventListener('click', (event) => {
      const selectedOption = event.currentTarget.getAttribute('data-option');
      handleActionMenuOption(selectedOption);
    });
  });

  songNames.forEach(songName => {
    songName.addEventListener('click', function() {
      initializeSongQueue(songName, songList, queueList, playButton, volumeSlider, trackSlider, playbackDurationField);
      playSong(songName.getAttribute('songid'), playButton, volumeSlider, trackSlider, playbackDurationField, queueList);
    });
  });

  playButton.addEventListener('click', function() {
    if(song){
      togglePlayButton(playButton, volumeSlider);
    }
  });

  muteButton.addEventListener('click', function() {
    toggleMuteButton(muteButton, volumeSlider);
  });

  volumeSlider.addEventListener('input', function() {
    adjustSongVolume(volumeSlider, muteButton);
  });

  document.addEventListener('click', (event) => {
    //hide pop up options menus when you click outside them
    removeOpenDropDowns(event);
  });
  
  //sort lists of songs when app loads
  sortSongList(songList);								
}






//MENU OPERATIONS

//keyup search bar functionality
function searchSongByName(ul, input, clearText) {
    // Declare variables
    let filter, li, i;
    filter = input.value.toLowerCase();
    li = ul.getElementsByTagName('li');

    if (input.value){
      clearText.style.visibility = "visible"
    } else {
      clearText.style.visibility = "hidden"
    }
  
    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
      songEntry = li[i].getElementsByTagName("a")[0];
      artistEntry = li[i].getElementsByTagName("a")[1];
      songValue = songEntry.textContent || songEntry.innerText;
      artistValue = artistEntry.textContent || artistEntry.innerText;
      if (songValue.toLowerCase().indexOf(filter) > -1 || artistValue.toLowerCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }

  //forcibly reveal or hide main panels, overriding hover effect
  function showHidePanes(forceShow = false){  //can optionally pass value true to just show panes rather than toggle
    let panes = document.getElementsByClassName("maindivs");
    for(i = 0; i < panes.length; i++){
        if(panes[i].style.opacity == 0) {
            panes[i].style.opacity = 0.9;
        } else if (forceShow == false) {
            panes[i].style.opacity = 0;
        }
    }
  }

//clicking a song or artist name inside <a>, automatically sends to search bar and makes pane visible
  function searchLinkedTrack(a, songList, songSearchInput, clearSongSearch){
    let searchTerm = a.textContent || a.innerText;
    let input = document.getElementById('searchsongs');
    input.value = searchTerm;
    showHidePanes(true);
    searchSongByName(songList, songSearchInput, clearSongSearch);
  }

  function clearInput(songList, songSearchInput, clearSongSearch) {
    songSearchInput.value="";
    searchSongByName(songList, songSearchInput, clearSongSearch);
  }

  function sortSongList(ul) {
    const li =  ul.querySelectorAll("li");
    ul.append(...sortList(li))
  }

  const sortList = list => [...list].sort((a, b) => {
    const A = a.textContent;
    const B = b.textContent;
    return (A < B) ? -1 : (A > B) ? 1 : 0;
  });
  

  //allow placement of draggable object in correct order among other draggables
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.draggableQueue:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2; //half height subtracted from top of box to find center of each element
      //if offset is negative then we are above the element. offset closest to zero corresponds to the closest element to our cursor
      if (offset < 0 && offset > closest.offset ) { 
        return { offset: offset, element: child }
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element; //ensure initial offset always gets overwritten; any offset is greater than default
  }

  //clear all open dropdown windows on the page
  function removeOpenDropDowns (event = null) {
    const dropdown = document.getElementById("active-action-menu-dropdown");
    if (dropdown != null) {
      //if the user clicked anywhere on the page except on the button or menu themselves 
      //(prevents dropdown immediately opening and closing on initial click)
      if(event==null || (!dropdown.parentElement.querySelector(".actionbutton").contains(event.target) && !dropdown.contains(event.target))){
        dropdown.style.display = 'none'; 
        dropdown.removeAttribute("id");
      } 
    }
  }

  function handleActionMenuOption(option) {
    //placeholder
    console.log(option + 'selected');
    removeOpenDropDowns();
  }

  async function loadSongList(songList) {
    //get json of all songs via GET request
    const getAllSongsUrl = "http://localhost:3000/songs";
    let listItems = "";
    let response = await fetch(getAllSongsUrl);
    let data = await response.json();
    data.songs.forEach(song => {
      //add each to the block of html we will add
          listItems +=
            `<li>
                <div class="tracklistitem">
                  <div class="trackdetailscontainer">
                    <div class="overflowwrapper">
                      <a class="songname" draggable=false href="#" songId ="${song.id}">${song.name}</a>
                      <br>
                      <a class="artistname songsearchlink" href="#">${song.artist_name}</a>
                    </div>
                  </div>
                  <div class="actionmenucontainer">
                    <button class="actionbutton">
                      <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" focusable="false" class="actionbuttonicon">
                        <path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"></path>
                      </svg>
                    </button>
                    <div class="actionmenudropdown">
                      <div class="actionmenuoption" data-option="Play next">Play next</div>
                      <div class="actionmenuoption" data-option="Add to queue">Add to queue</div>
                      <div class="actionmenuoption" data-option="Add to playlist">Add to playlist</div>
                    </div>	
                  </div>
                </div>
              </li>`;
        });
        return listItems;
  }


  

  //SONG CONTROLS


  async function playSong(id, playButton, volumeSlider, trackSlider, playbackDurationField, queueList){
    const getSongDetailsUrl = "http://localhost:3000/songs/" + id; //use song id to get details
    let response = await fetch(getSongDetailsUrl);
    let data = await response.json();
    //make strings appropriate for browser & static reference
    let filepath = 'http://localhost:3000/' + encodeURIComponent(data.filepath.slice(data.filepath.lastIndexOf("\\")+1));
    let nowPlayingSong = document.getElementById('nowplayingsongname').getElementsByClassName('songsearchlink')[0];
    let nowPlayingArtist = document.getElementById('nowplayingartistname').getElementsByClassName('songsearchlink')[0];
    nowPlayingSong.innerText = data.name;
    nowPlayingArtist.innerText = data.artist_name;
    //stop the currently playing song
    if(song){
      if (!song.paused) {
        await togglePlayButton(playButton, volumeSlider);
      }
      song = null;
    };
    //reassign song variable to the new song that was just triggered
    song = await new Audio(filepath);
    song.load();
    //if we are still in playing state, dont toggle to off state - we are likely in the middle of a queue.
    if(playButton.getAttribute('status') == "playing"){
      song.volume = volumeSlider.value;
      await song.play();
    } else {
      await togglePlayButton(playButton, volumeSlider);
    }
    addSongEventListeners(id, playButton, volumeSlider, trackSlider, playbackDurationField, queueList);
    trackSlider.value = 0;
    updatePlaybackPositionValue(trackSlider);
    trackSlider.max = song.duration;
    playbackDurationField.innerText = Math.floor(song.duration / 60) + ":" + String(Math.floor(song.duration % 60)).padStart(2, '0');

  }

  async function togglePlayButton(playButton, volumeSlider) {
    const pauseIcon = 
      `<svg role="img" viewBox="0 0 16 16" class="playicon">
					<path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
				</svg>`;
    const playIcon = 
      `<svg role="img" viewBox="0 0 16 16" class="playicon">
        <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"></path>
      </svg>`;

    const playButtonInner = playButton.getElementsByClassName('playbuttoninner')[0].getElementsByClassName('playiconwrapper')[0];
    if (playButton.getAttribute('status') == "paused") {
      playButton.setAttribute('status', 'playing');
      playButtonInner.innerHTML = pauseIcon;
      song.volume = volumeSlider.value;
      await song.play();
    } else if (playButton.getAttribute('status') == "playing") {
      playButton.setAttribute('status', 'paused');
      playButtonInner.innerHTML = playIcon;
      await song.pause();
    }
  }

  function toggleMuteButton(muteButton, volumeSlider) {
    const unmutedIcon = 
      `<svg role="presentation" id="volume-icon" viewBox="0 0 16 16" class="tracknavicon">
					<path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"></path>
					<path d="M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z"></path>
			  </svg>`;
    const mutedIcon =
      `<svg role="presentation" id="volume-icon" viewBox="0 0 16 16" class="tracknavicon">
        <path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z"></path>
        <path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z"></path>
      </svg>`;

    if (muteButton.getAttribute('status') == "muted") {
      muteButton.setAttribute('status', 'unmuted');
      muteButton.innerHTML = unmutedIcon;
      if(song){
        volumeSlider.value = song.volume;
        song.muted = false;
      } else {
        volumeSlider.value = 0;
      }
    } else if (muteButton.getAttribute('status') == "unmuted") {
      muteButton.setAttribute('status', 'muted');
      muteButton.innerHTML = mutedIcon;
      volumeSlider.value = 0;
      if(song) {
        song.muted = true;
      }
    }
    
  }


  function adjustSongVolume(volumeSlider, muteButton) {
    if(song){song.volume = volumeSlider.value};
    //if volume slider value is under certain thresholds, change volume icon to represent a lower volume.
    const lowVolume =
      `<svg role="presentation" id="volume-icon" viewBox="0 0 16 16" class="tracknavicon">
        <path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 6.087a4.502 4.502 0 0 0 0-8.474v1.65a2.999 2.999 0 0 1 0 5.175v1.649z"></path>
      </svg>`;
    const highVolume = 
      `<svg role="presentation" id="volume-icon" viewBox="0 0 16 16" class="tracknavicon">
					<path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"></path>
					<path d="M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z"></path>
			</svg>`;

      const muted =
      `<svg role="presentation" id="volume-icon" viewBox="0 0 16 16" class="tracknavicon">
        <path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z"></path>
        <path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z"></path>
      </svg>`;
    if (volumeSlider.value == 0) {
      muteButton.innerHTML = muted;
    }
    else if (volumeSlider.value < 0.5) {
      muteButton.innerHTML = lowVolume;
    } else { 
      muteButton.innerHTML = highVolume;
    }
  }

  function addSongEventListeners(songId, playButton, volumeSlider, trackSlider, playbackDurationField, queueList) {
    song.addEventListener('timeupdate', function() {
      trackSlider.value = song.currentTime;
      updatePlaybackPositionValue(trackSlider);
    })
    
    //handle when song ends
    song.addEventListener('ended', function() {
      //if there are more songs in the queue:
      if (queue.indexOf(songId) < queue.length-1){
        let nextSongId = queue[queue.indexOf(songId)+1]
        playSong(nextSongId, playButton, volumeSlider, trackSlider, playbackDurationField, queueList);
        updateQueueAppearance(queueList, queueList.querySelector(`a[songId="${nextSongId}"]`).closest("li"));
      } else {
        trackSlider.value = 0;
        updatePlaybackPositionValue(trackSlider);
        togglePlayButton(playButton, volumeSlider);
      }
    });

  }

  function updatePlaybackPositionValue(trackSlider) {
    playbackPositionValue = trackSlider.parentElement.querySelector('#playbackposition');
    playbackPositionValue.innerHTML =  Math.floor(trackSlider.value / 60) + ":" + String(Math.floor(trackSlider.value % 60)).padStart(2, '0');
  }

  async function initializeSongQueue(songName, songList, queueList, playButton, volumeSlider, trackSlider, playbackDurationField) {
    //clear queue and prepare to populate with subsequent songs in search field
    queue = [];
    let allSongs = songList.querySelectorAll('li');
    let currentSongIndex = Array.prototype.indexOf.call(allSongs, songName.closest('li')); //how far down the list of all songs is the selected one?
    let currentSongId = allSongs[currentSongIndex].querySelector('.songname').getAttribute("songid");

    //using all songs that are visible in the current search field, form a queue
    for (i = 0; i < allSongs.length; i++) {
      if (allSongs[i].style.display != "none") {       
        queue.push(allSongs[i].querySelector('.songname').getAttribute("songid"));
      }
    }

    currentSongIndex = queue.indexOf(currentSongId); //updated index among only visible songs
    //populate queue window with list items
    queueList.innerHTML = "" //clear current queue
    let listItems = await generateQueueListItems(currentSongIndex); 
    queueList.innerHTML = listItems;
    queueList.querySelector(".queuecurrent").scrollIntoView({behavior: "smooth"});
    addQueueEventListeners(queueList, playButton, volumeSlider, trackSlider, playbackDurationField);
  }

  async function generateQueueListItems(currentSongIndex) {
      let listItems = "";
      for (i = 0; (i < queue.length) && (i < 100); i++) { //Max queue size until efficient way of making thousands of requests
        let id = queue[i];
        const getSongDetailsUrl = "http://localhost:3000/songs/" + id; //use song id to get details
        let response = await fetch(getSongDetailsUrl);
        let data = await response.json();
        let styleClass = "";
        if(i == currentSongIndex){
          styleClass = "queuecurrent";
        } else if (i < currentSongIndex) {
          styleClass = "queuehistory";
        } 
        listItems +=
                  `<li class="draggableQueue" draggable="true"><!--single song li block-->
                    <div class="tracklistitem ${styleClass}"><!--flex container-->
                      <div class="trackdetailscontainer"><!--track name and artist-->
                        <div class="overflowwrapper"><!--allow overflow ellipsis-->
                          <a class="songname" href="#" songId="${data.id}">${data.name}</a>
                          <br>
                          <a class="artistname songsearchlink" href="#">${data.artist_name}</a>
                        </div>
                      </div><div class="actionmenucontainer"><!--container for options button-->
                        <button class="actionbutton">
                          <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" focusable="false" class="actionbuttonicon">
                            <path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"></path>
                          </svg>
                        </button>
                        <div class="actionmenudropdown">
                          <div class="actionmenuoption" data-option="Play next">Play next</div>
                          <div class="actionmenuoption" data-option="Add to queue">Add to queue</div>
                          <div class="actionmenuoption" data-option="Add to playlist">Add to playlist</div>
                        </div>	
                      </div>
                    </div>
                  </li>`;
      }
      return listItems;
  };

  function addQueueEventListeners(queueList, playButton, volumeSlider, trackSlider, playbackDurationField) {
      //allow songs in queue to be dragged
      let queueDraggables = document.querySelectorAll(".draggableQueue");
      queueDraggables.forEach(draggable => {
        //add dragging class to an item when you start dragging it, after a delay
        draggable.addEventListener('dragstart', () => {
          setTimeout(() => draggable.classList.add('dragging'), 0);
        });

        //remove dragging class when you let go
        draggable.addEventListener('dragend', () => {
          draggable.classList.remove('dragging');
          let currentSong = queueList.querySelector(".queuecurrent").querySelector(".songname").closest("li");
          updateQueueAppearance(queueList, currentSong);

          //update actual queue array
          let listItems = queueList.querySelectorAll("li");
          queue = [];
          //using all songs that are visible in the current search field, form a queue
          for (i = 0; i < listItems.length; i++) {
            if (listItems[i].style.display != "none") {       
              queue.push(listItems[i].querySelector('.songname').getAttribute("songid"));
            }
          }
        });

        draggable.addEventListener('dragenter', () => {
          draggable.classList.add('over');
        });

        draggable.addEventListener('dragleave', () => {
          draggable.classList.remove('over');
        });

        //add click events to the newly generated html
        let songNameLink = draggable.querySelector('.songname');
        songNameLink.addEventListener('click', () => {
          playSong(songNameLink.getAttribute('songid'), playButton, volumeSlider, trackSlider, playbackDurationField, queueList); //play song when clicked
          updateQueueAppearance(queueList, songNameLink.closest("li"));
        });
      });
  }

  function updateQueueAppearance(queueList, songToPlay) {
    //set styles of all songs before and after the currently playing one to reflect queue state
    let listItems = queueList.querySelectorAll("li");
    let nextSongIndex = Array.prototype.indexOf.call(listItems, songToPlay); //how far down the list of all songs is the selected one?
    for(i = 0; i < listItems.length; i++){
      let item = listItems[i].querySelector('.tracklistitem');
      if(i == nextSongIndex){
        //set style of song we want to play next
        item.classList.remove("queuehistory");
        item.classList.add("queuecurrent");
      } else {
        if(i < nextSongIndex){
          item.classList.add("queuehistory");
          item.classList.remove("queuecurrent");
        } else if (i > nextSongIndex) {
          item.classList.remove("queuehistory");
          item.classList.remove("queuecurrent");
        }
      }
    }
    songToPlay.scrollIntoView({behavior: "smooth"});
  }

  window.onload=init;