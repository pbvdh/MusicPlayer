//Namespace containing classes
const CLASSES = (function () {

  class NowPlayingInfo {
    constructor(song, queue) {
      this.song = song;
      this.queue = queue;
      this.unshuffledQueue;
      this.unshuffledQueueList;
    }
  }

  return {
    NowPlayingInfo,
  }
})();

//Namespace for running app - DOM elements, event listeners, and functions triggered by those listeners
const APP = (function () {

window.onload = init;

//hold currently playing song and queue
let nowPlayingInfo = new CLASSES.NowPlayingInfo(null, []); 

//DOM elements
let songSearchLinks;
let clearSongSearch;
let songSearchInput;
let trackSlider;
let playbackDurationField;
let actionButtons;
let actionMenuOptions;
let queueList;
let songNames;
let playButton;
let muteButton;
let volumeSlider;
let previousTrackButton;
let nextTrackButton;
let shuffleButton;
let shuffleIcon;
let showQueueButton;
let showQueueIcon;
let clearQueueButton;
let toggleLibraryButton;
let songList;
let artistList;

//define DOM elements and assign event listeners. Dynamically generate content as required
async function init() {

  //Generate HTML that needs to be created before event listeners are added 
  //song library
  songList = document.getElementById("songlist");
  try {
    let songListItems = await loadSongList();
    songList.innerHTML = songListItems;
  } catch {
    console.error("Error fetching songs:\n" + error);
  }
  
  //artist library
  artistList = document.getElementById("artistlist");
  try {
    let artistListItems = await loadArtistList();
    artistList.innerHTML = artistListItems;
  } catch(error) {
    console.error("Error fetching artists:\n" + error);
  }
  

  //event listeners for DOM
  songSearchLinks = document.querySelectorAll(".songsearchlink");
  clearSongSearch = document.getElementById("searchsongsclearbutton");
  songSearchInput = document.getElementById("searchsongs");
  trackSlider = document.getElementById("trackslider");
  playbackDurationField = document.getElementById("playbackduration");
  actionButtons = document.querySelectorAll(".actionbutton");
  actionMenuOptions = document.querySelectorAll(".actionmenuoption");
  queueList = document.getElementById("queuelist");
  songNames = document.querySelectorAll(".songname");
  playButton = document.getElementById("playbutton");
  muteButton = document.getElementById("mutebutton");
  volumeSlider = document.getElementById("volumeslider");
  previousTrackButton = document.getElementById("previousbutton");
  nextTrackButton = document.getElementById("nextbutton");
  shuffleButton = document.getElementById("shufflebutton");
  shuffleIcon = shuffleButton.querySelector(".tracknavicon");
  showQueueButton = document.getElementById("showqueuebutton");
  showQueueIcon = showQueueButton.querySelector(".tracknavicon");
  clearQueueButton = document.getElementById("clearqueuebutton");
  toggleLibraryButton = document.getElementById("togglelibrarybutton");

  //handle a song getting dragged within the song queue
  queueList.addEventListener('dragover', function (e) {
    e.preventDefault();
    const afterElement = getDragAfterElement(queueList, e.clientY);
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
      queueList.appendChild(draggable);
    } else {
      queueList.insertBefore(draggable, afterElement);
    }
  });

  //toggle whether the menu panes are visible
  showQueueButton.addEventListener('click', function () {
    showHidePanes();
  });

  //clear search window button
  clearSongSearch.addEventListener('click', function () {
    clearInput();
  });

  //handle searching for songs in library
  songSearchInput.addEventListener('input', function () {
    searchSongByName(songList);
    searchSongByName(artistList);
  });

  //update the current position string (timestamp) for the track slider
  trackSlider.addEventListener('input', function () {
    updatePlaybackPositionValue();
    nowPlayingInfo.song.currentTime = trackSlider.value;
  });

  //add event listeners for the kebab menu on song cards
  addActionMenuEventListeners(actionButtons, actionMenuOptions);

  //when clicking a song, play it and start a queue using the songs around it
  songNames.forEach(songName => {
    songName.addEventListener('click', function () {
      playSong(songName.getAttribute('songid'));
      shuffleIcon.classList.remove("toggledon");
      initializeSongQueue(songName);
    });
  });
  
  //if an the name of an artist is clicked within our app, we input it as a search
  songSearchLinks.forEach(songSearchLink => {
    songSearchLink.addEventListener('click', function () {
      searchLinkedTrack(songSearchLink);
    });
  });

  //resume playing current song
  playButton.addEventListener('click', function () {
    if (nowPlayingInfo.song) {
      togglePlayButton();
    }
  });

  //mute audio 
  muteButton.addEventListener('click', function () {
    toggleMuteButton();
  });

  //change volume
  volumeSlider.addEventListener('input', function () {
    adjustSongVolume();
  });

  //go to previous song in queue
  previousTrackButton.addEventListener('click', async function() {
    if(queueList.childElementCount > 0) {
      let currentTrack = queueList.querySelector(".queuecurrent").querySelector(".songname");
      let trackIndex = nowPlayingInfo.queue.indexOf(currentTrack.getAttribute("songid"))-1;
      if (trackIndex >= 0) {
        playSong(nowPlayingInfo.queue[trackIndex]);
        updateQueueAppearance(currentTrack.closest("li").previousSibling);
      } else {
        //restart song
        await playSong(nowPlayingInfo.queue[trackIndex+1]);
      }
    }
  });

  //go to next song in queue
  nextTrackButton.addEventListener('click', async function() {
    if(queueList.childElementCount > 0) {
      let currentTrack = queueList.querySelector(".queuecurrent").querySelector(".songname");
      let trackIndex = nowPlayingInfo.queue.indexOf(currentTrack.getAttribute("songid"))+1;
      if (trackIndex < nowPlayingInfo.queue.length) {
        playSong(nowPlayingInfo.queue[trackIndex])
        updateQueueAppearance(currentTrack.closest("li").nextSibling);
      } else {
        //restart song
        await playSong(nowPlayingInfo.queue[trackIndex-1]);
      }
    }
  });

  //shuffle queue
  shuffleButton.addEventListener('click', function() {
    shuffleSongQueue();
  });

  //switch between artist and song libraries
  toggleLibraryButton.addEventListener('click', function() {
    if (toggleLibraryButton.getAttribute("status") == "toartists") {
      toggleLibraryButton.setAttribute("status", "tosongs");
      toggleLibraryButton.innerText = "Songs";
      songList.style.display = "none";
      artistList.style.display = "initial";
    } else {
      toggleLibraryButton.setAttribute("status", "toartists");
      toggleLibraryButton.innerText = "Artists";
      artistList.style.display = "none";
      songList.style.display = "initial";
    }
  });

  //empty the current queue
  clearQueueButton.addEventListener('click', function() {
    if(queueList.childElementCount > 0) {
      nowPlayingInfo.queue = [queueList.querySelector(".queuecurrent").querySelector(".songname").getAttribute("songid")];
      let queueListItems = [...queueList.querySelectorAll(".tracklistitem:not(.queuecurrent)")];
      queueListItems.forEach(queueListItem => {
        queueListItem.closest("li").remove();
      });
    }
  });

  //hide pop up options menus when you click outside them
  document.addEventListener('click', function (event)  {
    removeOpenDropDowns(event);
  });

  //sort libraries when app loads
  sortSongList(songList);
  sortSongList(artistList);
}














//EVENT LISTENERS
//Add event listeners to kebab menus on song cards
function addActionMenuEventListeners(actionButtons, actionMenuOptions) {
  //pop up options menus on song panels
  actionButtons.forEach(actionButton => {
    let dropdown = actionButton.parentElement.querySelector('.actionmenudropdown');
    actionButton.addEventListener('click', function (event) {
      removeOpenDropDowns(event); //clear existing pop ups if there are any
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      dropdown.setAttribute("id", "active-action-menu-dropdown"); //identifier with which to remove open drop downs
    });
  });

  actionMenuOptions.forEach(option => {
    option.addEventListener('click', function (event) {
      let selectedOption = event.currentTarget.getAttribute('data-option');
      let songCard = option.closest("li");
      handleActionMenuOption(selectedOption, songCard);
    });
  });
}

//add listeners to currently playing song
function addSongEventListeners(songId) {
  nowPlayingInfo.song.addEventListener('timeupdate', function () {
    trackSlider.value = nowPlayingInfo.song.currentTime;
    updatePlaybackPositionValue();
  })

  //handle when song ends
  nowPlayingInfo.song.addEventListener('ended', function () {
    //if there are more songs in the queue:
    if (nowPlayingInfo.queue.indexOf(songId) < nowPlayingInfo.queue.length - 1) {
      let nextSongId = nowPlayingInfo.queue[nowPlayingInfo.queue.indexOf(songId) + 1]
      playSong(nextSongId);
      updateQueueAppearance(queueList.querySelector(`a[songId="${nextSongId}"]`).closest("li"));
    } else {
      trackSlider.value = 0;
      updatePlaybackPositionValue();
      togglePlayButton();
    }
  });
}

//add event listeners to the queue we generated
function addQueueEventListeners(queueItems) {
  //determine if we were passed a draggable item or a list containing draggable items.
  let queueDraggables = queueItems.classList.contains("draggableQueue") ? [queueItems] : queueItems.querySelectorAll(".draggableQueue");
  //allow songs in queue to be dragged
  queueDraggables.forEach(draggable => {
    //add dragging class to an item when you start dragging it, after a delay
    draggable.addEventListener('dragstart', () => {
      setTimeout(() => draggable.classList.add('dragging'), 0);
    });

    //remove dragging class when you let go
    draggable.addEventListener('dragend', () => {
      draggable.classList.remove('dragging');
      let currentSong = queueList.querySelector(".queuecurrent").querySelector(".songname").closest("li");
      updateQueueAppearance(currentSong, false);

      //update actual queue array
      let listItems = queueList.querySelectorAll("li");
      nowPlayingInfo.queue = [];
      //using all songs that are visible in the current search field, form a queue
      for (let i = 0; i < listItems.length; i++) {
        if (listItems[i].style.display != "none") {
          nowPlayingInfo.queue.push(listItems[i].querySelector('.songname').getAttribute("songid"));
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
      playSong(songNameLink.getAttribute('songid')); //play song when clicked
      updateQueueAppearance(songNameLink.closest("li"));
    });

    let artistNameLink = draggable.querySelector('.artistname');
    //if an the name of an artist is clicked within our app, we input it as a search
    artistNameLink.addEventListener('click', () => {
        searchLinkedTrack(artistNameLink);
    });
  });

  addActionMenuEventListeners(queueItems.querySelectorAll(".actionbutton"), queueItems.querySelectorAll(".actionmenuoption"));
}




//MENU OPERATIONS
//keyup search bar functionality
function searchSongByName(ul) {
  // Declare variables
  let filter, li, i, songEntry, songValue, artistEntry, artistValue;
  filter = songSearchInput.value.toLowerCase();
  li = ul.getElementsByTagName('li');

  if (songSearchInput.value) {
    clearSongSearch.style.visibility = "visible"
  } else {
    clearSongSearch.style.visibility = "hidden"
  }

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    songEntry = li[i].getElementsByTagName("a")[0];
    songValue = songEntry.textContent || songEntry.innerText;

    artistEntry = li[i].getElementsByTagName("a")[1];
    if(artistEntry == null){artistEntry = songEntry} //in the case where there is no second entry just use the first one
    artistValue = artistEntry.textContent || artistEntry.innerText;

    if (songValue.toLowerCase().indexOf(filter) > -1 || artistValue.toLowerCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

//forcibly reveal or hide main panels, overriding hover effect
function showHidePanes(forceShow = false) {  //can optionally pass value true to just show panes rather than toggle
  let panes = document.getElementsByClassName("maindivs");

  if (!showQueueIcon.classList.contains("toggledon")) {
    for (let i = 0; i < panes.length; i++) {
      panes[i].style.opacity = 0.95;
    }
    showQueueIcon.classList.add("toggledon");
  } else if (forceShow == false) {
    for (let i = 0; i < panes.length; i++) {
      panes[i].style.opacity = 0;
    }
    showQueueIcon.classList.remove("toggledon");
  }
}

//clicking a song or artist name inside <a>, automatically sends to search bar and makes pane visible
function searchLinkedTrack(a) {
  let searchTerm = a.textContent || a.innerText;
  let input = document.getElementById('searchsongs');
  input.value = searchTerm;
  showHidePanes(true);
  searchSongByName(songList);
  searchSongByName(artistList);
}

function clearInput() {
  songSearchInput.value = "";
  searchSongByName(songList);
  searchSongByName(artistList);
}

function sortSongList(ul) {
  const li = ul.querySelectorAll("li");
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
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element; //ensure initial offset always gets overwritten; any offset is greater than default
}

//clear all open dropdown windows on the page
function removeOpenDropDowns(event = null) {
  const dropdown = document.getElementById("active-action-menu-dropdown");
  if (dropdown != null) {
    //if the user clicked anywhere on the page except on the button or menu themselves 
    //(prevents dropdown immediately opening and closing on initial click)
    if (event == null || (!dropdown.parentElement.querySelector(".actionbutton").contains(event.target) && !dropdown.contains(event.target))) {
      dropdown.style.display = 'none';
      dropdown.removeAttribute("id");
    }
  }
}

//Perform an action based on the selected dropdown option on song card - add to queue or playlist or remove from queue
function handleActionMenuOption(option, songCard) {
  removeOpenDropDowns();
  let songQueue = [...queueList.querySelectorAll("li")];
  let selectedSongId = songCard.querySelector(".songname").getAttribute("songid");
  let currentSong;
  let copy = songCard.cloneNode(true);

  switch (option.toLowerCase()) {
    case "play next":
      copy = songCard.cloneNode(true);
      copy.classList.add("draggableQueue");
      copy.setAttribute("draggable", "true"); 
      copy.querySelector(".tracklistitem").classList.remove("queuecurrent");
      copy.querySelector(".tracklistitem").classList.remove("queuehistory");
      //if the queue is empty
      if(nowPlayingInfo.queue.length == 0){
        queueList.appendChild(copy);
        nowPlayingInfo.queue.push(selectedSongId);
        currentSong = queueList.querySelector("li");
      } else { 
        currentSong = queueList.querySelector(".queuecurrent").closest("li");
        let currentSongIndex = Array.prototype.indexOf.call(songQueue, currentSong);
        let currentSongId = currentSong.querySelector(".songname").getAttribute("songid");
        queueList.insertBefore(copy, queueList.children[currentSongIndex + 1]);
        nowPlayingInfo.queue.splice(nowPlayingInfo.queue.indexOf(currentSongId)+1, 0, selectedSongId);
      }

      updateQueueAppearance(currentSong);
      addQueueEventListeners(copy);
      break;
    case "add to queue":
      copy.classList.add("draggableQueue");
      copy.setAttribute("draggable", "true");
      //dont need to do full queue update, as this item is always going at the end we can just strip its styles
      copy.querySelector(".tracklistitem").classList.remove("queuecurrent");
      copy.querySelector(".tracklistitem").classList.remove("queuehistory");

      queueList.appendChild(copy);
      nowPlayingInfo.queue.push(selectedSongId);

      //only add event listeners to the 'copy' item to prevent dupes
      addQueueEventListeners(copy);
      break;
    case "add to playlist":
      console.log(option + 'selected');
      //awaiting playlist functionality
      //use API call with songid
      break;
    case "remove from queue":
      //if you removed the current item, reassign and skip if there are more, otherwise pause
      if(songCard.querySelector(".tracklistitem").classList.contains("queuecurrent")){
        if(nowPlayingInfo.queue.length > 1){
          //either there are only historic elements, only future elements, or both
          //in which case we must; make the previous element current, make a future element current, or make a future element current
          let currentSongIndex = Array.prototype.indexOf.call(songQueue, songCard);

          songCard.remove(); //remove from DOM
          songQueue.splice(currentSongIndex, 1); //remove from reference array
          nowPlayingInfo.queue.splice(currentSongIndex, 1); //remove from playing queue

          let newCurrentSongIndex = Math.min(currentSongIndex, nowPlayingInfo.queue.length-1);
          songQueue[newCurrentSongIndex].querySelector(".tracklistitem").classList.remove("queuehistory");
          songQueue[newCurrentSongIndex].querySelector(".tracklistitem").classList.add("queuecurrent");
          playSong(nowPlayingInfo.queue[newCurrentSongIndex]);
        } 
      } else {
        currentSong = queueList.querySelector(".queuecurrent").closest("li");
        let selectedSongIndex = Array.prototype.indexOf.call(songQueue, songCard);
        nowPlayingInfo.queue.splice(selectedSongIndex, 1);
        songCard.remove();
        updateQueueAppearance(currentSong, false);
      }
      break;
  }
  removeOpenDropDowns();
}




//API calls
//get songs from database and turn into blocks of HTML
async function loadSongList() {
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
                      <div class="actionmenuoption queueoption" data-option="Remove from queue">Remove from queue</div>
                    </div>	
                  </div>
                </div>
              </li>`;
  });
  return listItems;
}

//get artists from database and turn into blocks of html
async function loadArtistList() {
  //get json of all songs via GET request
  const getAllArtistsUrl = "http://localhost:3000/artists";
  let listItems = "";
  let response = await fetch(getAllArtistsUrl);
  let data = await response.json();
  data.artists.forEach(artist => {
    //add each to the block of html we will add
    listItems +=
              `<li>
                <div class="tracklistitem">
                  <div class="trackdetailscontainer">
                    <div class="overflowwrapper">
                      <a class="artistname songsearchlink" href="#">${artist.artist_name}</a>
                    </div>
                  </div>
                </div>
              </li>`;
  });
  return listItems;
}







//SONG CONTROLS
//when a song needs to begin playing (due to song end, resume, new queue etc)
async function playSong(id) {
  const getSongDetailsUrl = "http://localhost:3000/songs/" + id; //use song id to get details
  let response = await fetch(getSongDetailsUrl);
  let data = await response.json();
  //make strings appropriate for browser & static reference
  let filepath = 'http://localhost:3000/' + encodeURIComponent(data.filepath.slice(data.filepath.lastIndexOf("\\") + 1));
  let nowPlayingSong = document.getElementById('nowplayingsongname').getElementsByClassName('songsearchlink')[0];
  let nowPlayingArtist = document.getElementById('nowplayingartistname').getElementsByClassName('songsearchlink')[0];
  nowPlayingSong.innerText = data.name;
  nowPlayingArtist.innerText = data.artist_name;
  //stop the currently playing song
  if (nowPlayingInfo.song) {
    if (!nowPlayingInfo.song.paused) {
      await togglePlayButton();
    }
    nowPlayingInfo.song = null;
  };
  //reassign song variable to the new song that was just triggered
  nowPlayingInfo.song = new Audio(filepath);
  nowPlayingInfo.song.load();
  //if we are still in playing state, dont toggle to off state - we are likely in the middle of a queue.
  if (playButton.getAttribute('status') == "playing") {
    nowPlayingInfo.song.volume = volumeSlider.value;
    await nowPlayingInfo.song.play();
  } else {
    await togglePlayButton();
  }
  addSongEventListeners(id);
  trackSlider.value = 0;
  updatePlaybackPositionValue();
  trackSlider.max = nowPlayingInfo.song.duration;
  playbackDurationField.innerText = Math.floor(nowPlayingInfo.song.duration / 60) + ":" + String(Math.floor(nowPlayingInfo.song.duration % 60)).padStart(2, '0');

}

//play or pause song
async function togglePlayButton() {
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
    nowPlayingInfo.song.volume = volumeSlider.value;
    await nowPlayingInfo.song.play();
  } else if (playButton.getAttribute('status') == "playing") {
    playButton.setAttribute('status', 'paused');
    playButtonInner.innerHTML = playIcon;
    await nowPlayingInfo.song.pause();
  }
}

//mute or unmute song
function toggleMuteButton() {
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
    if (nowPlayingInfo.song) {
      volumeSlider.value = nowPlayingInfo.song.volume;
      nowPlayingInfo.song.muted = false;
    } else {
      volumeSlider.value = 0;
    }
  } else if (muteButton.getAttribute('status') == "unmuted") {
    muteButton.setAttribute('status', 'muted');
    muteButton.innerHTML = mutedIcon;
    volumeSlider.value = 0;
    if (nowPlayingInfo.song) {
      nowPlayingInfo.song.muted = true;
    }
  }
}

//change volume
function adjustSongVolume() {
  if (nowPlayingInfo.song) { nowPlayingInfo.song.volume = volumeSlider.value };
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

//Update the timestamp string
function updatePlaybackPositionValue() {
  let playbackPositionValue = trackSlider.parentElement.querySelector('#playbackposition');
  playbackPositionValue.innerHTML = Math.floor(trackSlider.value / 60) + ":" + String(Math.floor(trackSlider.value % 60)).padStart(2, '0');
}

//create a queue of songs and display them in the playing queue
function initializeSongQueue(songNameLink) {
  //clear queue and prepare to populate with subsequent songs in search field
  nowPlayingInfo.queue = [];
  let allSongs = songList.querySelectorAll('li');
  let currentSongIndex = Array.prototype.indexOf.call(allSongs, songNameLink.closest('li')); //how far down the list of all songs is the selected one?
  let currentSongId = allSongs[currentSongIndex].querySelector('.songname').getAttribute("songid");

  //using all songs that are visible in the current search field, form a queue
  for (let i = 0; i < allSongs.length; i++) {
    if (allSongs[i].style.display != "none") {
      nowPlayingInfo.queue.push(allSongs[i].querySelector('.songname').getAttribute("songid"));
    }
  }

  currentSongIndex = nowPlayingInfo.queue.indexOf(currentSongId); //updated index among only visible songs
  //populate queue window with list items
  queueList.innerHTML = "" //clear current queue
  let listItems = generateQueueListItems(currentSongIndex, songList);
  listItems.forEach(listItem => {
    queueList.appendChild(listItem);
  })
  queueList.querySelector(".queuecurrent").scrollIntoView({ behavior: "smooth" });
  addQueueEventListeners(queueList);
}

//shuffle the song queue as well as its physical appearance
function shuffleSongQueue() {
  if (shuffleIcon.classList.contains("toggledon")) { //then unshuffle
    //check currently playing song via queuecurrent
    //return to unshuffled order but update queue appearance with currently playing song
    if (nowPlayingInfo.unshuffledQueue) {
      queueList.innerHTML = "";
      queueList.append(...nowPlayingInfo.unshuffledQueueList);
      nowPlayingInfo.queue = nowPlayingInfo.unshuffledQueue;
      let currentSongListItem = queueList.querySelector(".queuecurrent").closest("li");
      updateQueueAppearance(currentSongListItem);
    }
    shuffleIcon.classList.remove("toggledon");
  } else if(queueList.childElementCount > 0){ //shuffle
    //put aside currently playing song, to end up at top of queue
    let currentSongId = queueList.querySelector(".queuecurrent").querySelector(".songname").getAttribute("songid");
    let currentSongIndex = nowPlayingInfo.queue.indexOf(currentSongId);

    //shuffle queue array and list items simultaneously as they should be in the same order
    let queueListItems = [...queueList.children];
    let queueIndex = nowPlayingInfo.queue.length -1; //because we plan to splice out current song
    let queueListIndex = queueListItems.length -1; 
    let randomIndex;

    //store original queue ordering in unshuffled
    nowPlayingInfo.unshuffledQueueList = [...queueList.children];
    nowPlayingInfo.unshuffledQueue = [...nowPlayingInfo.queue];

    //if queue and list represenation are synced up, shuffle both in parallel
    if(queueIndex == queueListIndex && queueListIndex > 0){
      let currentSongElement = queueListItems.splice(currentSongIndex,1);
      nowPlayingInfo.queue.splice(currentSongIndex, 1);
      queueList.innerHTML = ""

      while (queueIndex != 0 ) {
        randomIndex = Math.floor(Math.random() * queueIndex);
        queueIndex--;
        queueListIndex--;
        //swap positions
        [nowPlayingInfo.queue[queueIndex], nowPlayingInfo.queue[randomIndex]] = [nowPlayingInfo.queue[randomIndex], nowPlayingInfo.queue[queueIndex]];
        [queueListItems[queueListIndex], queueListItems[randomIndex]] = [queueListItems[randomIndex], queueListItems[queueListIndex]]
      }

      queueList.append(...currentSongElement, ...queueListItems);
      nowPlayingInfo.queue.unshift(currentSongId);
      let currentSongListItem = queueList.querySelector(".queuecurrent").closest("li");
      updateQueueAppearance(currentSongListItem);
      shuffleIcon.classList.add("toggledon");
    }
  } else {
    shuffleIcon.classList.add("toggledon");
  }
}

//Create copies of song cards to populate new queue and add relevant classes for styling.
function generateQueueListItems(currentSongIndex, queueSource) {
  let listItems = queueSource.querySelectorAll("li");
  let newList = [];
  for (let i = 0; (i < listItems.length); i++) {
    if (listItems[i].style.display != "none") {
      let newListItem = listItems[i].cloneNode(true);
      newListItem.classList.add("draggableQueue");
      newListItem.setAttribute("draggable", "true");      
      newList.push(newListItem);
    }
  }
  for (let i = 0; (i < newList.length); i++) {
    if (i == currentSongIndex) {
      newList[i].querySelector(".tracklistitem").classList.add("queuecurrent");
    } else if (i < currentSongIndex) {
      newList[i].querySelector(".tracklistitem").classList.add("queuehistory");
    }
  }
  return newList;
};

//Examine the new queue order to update the song card styles if necessary
function updateQueueAppearance(songToPlay, scroll = true) {
  //set styles of all songs before and after the currently playing one to reflect queue state
  let listItems = queueList.querySelectorAll("li");
  let nextSongIndex = Array.prototype.indexOf.call(listItems, songToPlay); //how far down the list of all songs is the selected one?
  for (let i = 0; i < listItems.length; i++) {
    let item = listItems[i].querySelector('.tracklistitem');
    if (i == nextSongIndex) {
      //set style of song we want to play next
      item.classList.remove("queuehistory");
      item.classList.add("queuecurrent");
    } else {
      if (i < nextSongIndex) {
        item.classList.add("queuehistory");
        item.classList.remove("queuecurrent");
      } else if (i > nextSongIndex) {
        item.classList.remove("queuehistory");
        item.classList.remove("queuecurrent");
      }
    }
  }
  if(scroll){songToPlay.scrollIntoView({ behavior: "smooth" });}
}



return{}
})();







