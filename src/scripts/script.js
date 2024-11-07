//Namespace containing classes
const CLASSES = (function () {

  class NowPlayingInfo {
    constructor(song, queue) {
      this.song = song;
      this.queue = queue;
      this.unshuffledQueue;
      this.unshuffledQueueList;
      this.currentSongIndex;
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
let tabTitle;
let songSearchLinks;
let clearSongSearches;
let songSearchInputs;
let trackSlider;
let playbackDurationField;
let actionButtons;
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
let createPlaylistButton;
let songList;
let artistList;
let playlistList;
let playlistSongList;
let libraryPanel;
let playlistPanel;
let nowPlayingArtist;
let nowPlayingSong;
let playlistWindowHeader;

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

  playlistList = document.getElementById("playlistlist");
  try {
    let playlistListItems = await loadPlaylists();
    playlistList.innerHTML = playlistListItems;
  } catch(error) {
    console.error("Error fetching playlists:\n" + error);
  }
  

  //DOM elements
  tabTitle = document.querySelector("head title");
  songSearchLinks = document.querySelectorAll(".songsearchlink");
  clearSongSearches = document.querySelectorAll(".clearbutton");
  songSearchInputs = document.querySelectorAll(".searchsongs");
  trackSlider = document.getElementById("trackslider");
  playbackDurationField = document.getElementById("playbackduration");
  actionButtons = document.querySelectorAll(".actionbutton");
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
  createPlaylistButton = document.getElementById("createplaylistbutton");
  playlistSongList = document.getElementById("playlistsonglist");
  libraryPanel = document.getElementById("songs");
  playlistPanel = document.getElementById("playlists");
  nowPlayingSong = document.getElementById('nowplayingsongname').querySelector('.songsearchlink');
  nowPlayingArtist = document.getElementById('nowplayingartistname').querySelector('.songsearchlink');
  playlistWindowHeader = document.querySelector("#playlists .windowheader h1");
  
  //handle a song getting dragged within the song queue
  queueList.addEventListener('dragover', function (event) {
    event.preventDefault();

    // Throttle scroll event using requestAnimationFrame or setTimeout
    setTimeout(() => {
      handleScroll(queueList, event);
    }, 10); // Delay the scroll update to avoid overwhelming the browser

    const afterElement = getDragAfterElement(queueList, event.clientY);
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
  clearSongSearches.forEach(clearSongSearch => {
    clearSongSearch.addEventListener('click', function () {
      let searchBar = clearSongSearch.closest(".searchbar");
      let target = searchBar.getAttribute("for");
  
      searchBar.querySelector(".searchsongs").value="";
  
      if (target == "library") {
        searchSongByName(searchBar, songList);
        searchSongByName(searchBar, artistList);
      } else if (target == "playlists") {
        searchSongByName(searchBar, playlistList);
      }
    });
  });

  //handle searching for songs in library
  songSearchInputs.forEach(songSearchInput => {
    songSearchInput.addEventListener('input', function () {

      let searchBar = songSearchInput.closest(".searchbar");
      let target = searchBar.getAttribute("for");
  
      if (target == "library") {
        searchSongByName(searchBar, songList);
        searchSongByName(searchBar, artistList);
      } else if (target == "playlists") {
        searchSongByName(searchBar, playlistList);
      }
    });
  });

  //update the current position string (timestamp) for the track slider
  trackSlider.addEventListener('input', function () {
    updatePlaybackPositionValue();
    nowPlayingInfo.song.currentTime = trackSlider.value;
  });

  //add event listeners for the kebab menu on song cards
  addActionMenuEventListeners(actionButtons);

  addSongAndArtistEventListeners(songNames, songSearchLinks);

  //resume playing current song
  playButton.addEventListener('click', function () {
    if (nowPlayingInfo.song) { //there is a currently playing song, but it was paused
      togglePlayButton();
    } else if (nowPlayingInfo.queue) { //there is a song queued and ready to play
      let id = nowPlayingInfo.queue[nowPlayingInfo.currentSongIndex];
      playSong(id);
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
      let trackIndex = nowPlayingInfo.currentSongIndex-1;
      if (trackIndex >= 0) {
        if(nowPlayingInfo.currentSongIndex > 0){
          nowPlayingInfo.currentSongIndex--
        }
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
      let trackIndex = nowPlayingInfo.currentSongIndex+1;
      if (trackIndex < nowPlayingInfo.queue.length) {
        if(nowPlayingInfo.currentSongIndex < nowPlayingInfo.queue.length-1){
          nowPlayingInfo.currentSongIndex++;
        }
        playSong(nowPlayingInfo.queue[trackIndex]);
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
    toggleLibrary();
  });

  //empty the current queue
  clearQueueButton.addEventListener('click', function() {
    if(queueList.childElementCount > 0) {
      nowPlayingInfo.queue = nowPlayingInfo.queue[nowPlayingInfo.currentSongIndex];
      let queueListItems = [...queueList.querySelectorAll(".tracklistitem:not(.queuecurrent)")];
      queueListItems.forEach(queueListItem => {
        queueListItem.closest("li").remove();
      });
      nowPlayingInfo.currentSongIndex = 0;
    }
  });

  //create new playlist
  createPlaylistButton.addEventListener('click', function() {
    if(createPlaylistButton.getAttribute("status") == "create"){
      createPlaylist();
    } else if (createPlaylistButton.getAttribute("status") == "return") {

      createPlaylistButton.setAttribute("status", "create");
      createPlaylistButton.innerText = "Create";
      playlistWindowHeader.innerText = "Playlists";
      playlistWindowHeader.removeAttribute("playlistid");
      playlistSongList.style.display = "none";
      playlistList.style.display = "initial";

      //reset searchbar
      let searchBar = playlistPanel.querySelector(".searchbar");
      searchBar.querySelector(".searchsongs").value = "";
      searchSongByName(searchBar, playlistList);
    }
  });

  addPlaylistEventListeners();

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
function addActionMenuEventListeners(actionButtons) {
  //pop up options menus on song panels
  actionButtons.forEach(actionButton => { 
    actionButton.onclick = function (event) {
      removeOpenDropDowns(event); //clear existing pop ups if there are any
      let songCard = actionButton.closest("li");

      let type = songCard.closest(".maindivs").getAttribute("id");
      if(type=="playlists"){
        //even in playlist panel, we might want song actions depending on current view
        if(createPlaylistButton.getAttribute("status") == "return"){type = "playlistsongs"}
      }

      if(songCard.classList.contains("activeactionmenu")){
        songCard.style.removeProperty("background-color");
        songCard.classList.remove("activeactionmenu");
        if(document.querySelector(".actionmenudropdown")){
          document.querySelector(".actionmenudropdown").remove();
        }
      } else {
        //colour in selected song card
        songCard.style.backgroundColor = "#9f4995cc";
        songCard.classList.add("activeactionmenu");
        document.querySelector("body").appendChild(generateActionMenu(type));
        
        let dropdown = document.querySelector(".actionmenudropdown");

        //if dropdown would appear on right side of screen, 
        if(event.clientX > window.innerWidth/2){
          dropdown.style.transform = "translate(" + (event.clientX-dropdown.offsetWidth)  + "px, " + event.clientY + "px)";
        } else {
          dropdown.style.transform = "translate(" + event.clientX  + "px, " + event.clientY + "px)";
        }


        //add event listeners to newly created menu
        document.querySelectorAll(".actionmenuoption").forEach(option => {
          option.addEventListener('click', function (event) {
            let selectedOption = event.currentTarget.getAttribute('data-option');
            if(songCard.getElementsByClassName("songname").length == 1 || songCard.getElementsByClassName("artistname").length == 1) {
              handleSongActionMenuOption(selectedOption, songCard);
            } else if (songCard.getElementsByClassName("playlistname").length == 1) {
              handlePlaylistActionMenuOption(selectedOption, songCard);
            } else {
              console.error("Expected action menu parent to have song, artist or playlist name class.");
            }
          });

          if(option.getAttribute("data-option").toLowerCase() == "add to playlist"){
            option.addEventListener('mouseenter', async function () {
              //if dropdown menu isnt present yet, reveal it
              if (!option.querySelector(".playlistpopup")) { 
                await actionMenuRevealPlaylists();
              }
            });
          }
        });
      }
    };
  });
}

//add listeners to currently playing song
function addSongEventListeners() {
  nowPlayingInfo.song.addEventListener('timeupdate', function () {
    trackSlider.value = nowPlayingInfo.song.currentTime;
    updatePlaybackPositionValue();
  })

  //handle when song ends
  nowPlayingInfo.song.addEventListener('ended', function () {
    //if there are more songs in the queue:
    if (nowPlayingInfo.queue.currentSongIndex < nowPlayingInfo.queue.length - 1) {
      let nextSongId = nowPlayingInfo.queue[nowPlayingInfo.currentSongIndex + 1];
      nowPlayingInfo.currentSongIndex++;
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
      nowPlayingInfo.currentSongIndex = Array.prototype.indexOf.call(listItems, currentSong);
    });

    draggable.addEventListener('dragenter', () => {
      draggable.classList.add('over');
    });

    draggable.addEventListener('dragleave', () => {
      draggable.classList.remove('over');
    });

    //add click events to the newly generated html
    let songNameLink = draggable.querySelector('.songname');
    songNameLink.onclick = function() {
      playSong(songNameLink.getAttribute('songid')); //play song when clicked
      updateQueueAppearance(songNameLink.closest("li"));
      nowPlayingInfo.currentSongIndex = Array.prototype.indexOf.call(queueItems.querySelectorAll("li"), queueList.querySelector(".queuecurrent").closest("li"));
    };

    let artistNameLink = draggable.querySelector('.artistname');
    //if an the name of an artist is clicked within our app, we input it as a search
    artistNameLink.addEventListener('click', () => {
        searchLinkedTrack(libraryPanel.querySelector(".searchbar"), artistNameLink);
    });
  });
  addActionMenuEventListeners(queueItems.querySelectorAll(".actionbutton"));
}

//for items in playlists panel
function addPlaylistEventListeners() {
  let playlistActionButtons = playlistList.querySelectorAll(".actionbutton");
  let playlistNames = document.querySelectorAll(".playlistname");
  addActionMenuEventListeners(playlistActionButtons);

  //click events, toggle to song contents
    //when clicking a playlist, reveal its contents
    playlistNames.forEach(playlistName => {
      playlistName.addEventListener('click', async function () {
        let playlistId = playlistName.getAttribute("playlistid");
        //toggle create button
        createPlaylistButton.setAttribute("status", "return");
        createPlaylistButton.innerText = "Back";
        playlistWindowHeader.innerText = playlistName.innerText;
        playlistWindowHeader.setAttribute("playlistid", playlistId);
        playlistList.style.display = "none";
        playlistSongList.style.display = "initial";
  
        //reset search bar
        let searchBar = playlistPanel.querySelector(".searchbar");
        searchBar.querySelector(".searchsongs").value = "";
        searchSongByName(searchBar, playlistList);
  
        //api call to fetch songs in playlist
        playlistSongList.innerHTML = await loadPlaylistSongs(playlistId);


        //add event listeners to the newly generated html
        let songNameLinks = playlistSongList.querySelectorAll('.songname');
        let artistNameLinks = playlistSongList.querySelectorAll('.artistname');
        let playlistDraggables = playlistSongList.querySelectorAll(".draggablePlaylist");

        addSongAndArtistEventListeners(songNameLinks, artistNameLinks);
        addActionMenuEventListeners(playlistSongList.querySelectorAll(".actionbutton"));
        addPlaylistDraggableEventListeners(playlistDraggables);
      });
    });
}

function addSongAndArtistEventListeners(songNames, songSearchLinks) {
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
        searchLinkedTrack(libraryPanel.querySelector(".searchbar"), songSearchLink);
      });
    });
}

//allow songs on a playlist to be dragged
function addPlaylistDraggableEventListeners(playlistDraggables) {
    //handle a song getting dragged within a playlist
    playlistSongList.addEventListener('dragover', function(event) {
      event.preventDefault();

      // Throttle scroll event using requestAnimationFrame or setTimeout
      setTimeout(() => {
        handleScroll(playlistSongList, event);
      }, 10); // Delay the scroll update to avoid overwhelming the browser

      const afterElement = getDragAfterElement(playlistSongList, event.clientY);
      const draggable = document.querySelector('.dragging');
      if (afterElement == null) {
        playlistSongList.appendChild(draggable);
      } else {
        playlistSongList.insertBefore(draggable, afterElement);
      }
    });


    playlistDraggables.forEach(draggable => {
      //add dragging class to an item when you start dragging it, after a delay
      draggable.addEventListener('dragstart', () => {
        setTimeout(() => draggable.classList.add('dragging'), 0);
      });

      //remove dragging class when you let go
      draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging');
        //update position in DB
        let songId = draggable.querySelector(".songname").getAttribute("songid");
        let playlistId = playlistWindowHeader.getAttribute("playlistid");
        let newPosition = Array.prototype.indexOf.call(playlistSongList.querySelectorAll("li"), draggable);
        updatePlaylistSongPosition(songId, playlistId, newPosition);
      });

      draggable.addEventListener('dragenter', () => {
        draggable.classList.add('over');
      });

      draggable.addEventListener('dragleave', () => {
        draggable.classList.remove('over');
      });});
}






//MENU OPERATIONS
//keyup search bar functionality
function searchSongByName(searchBar, ul) {
  // Declare variables
  let filter, li, i, songEntry, songValue, artistEntry, artistValue;
  let input = searchBar.querySelector(".searchsongs");
  let clearButton = searchBar.querySelector(".clearbutton");
  filter = input.value.toLowerCase();
  li = ul.getElementsByTagName('li');

  if (input.value) {
    clearButton.style.visibility = "visible"
  } else {
    clearButton.style.visibility = "hidden"
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
function searchLinkedTrack(searchBar, a) {
  let searchTerm = a.textContent || a.innerText;
  let input = searchBar.querySelector(".searchsongs");
  input.value = searchTerm;
  showHidePanes(true);
  searchSongByName(searchBar, songList);
  searchSongByName(searchBar, artistList);
  toggleLibrary(true);
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
  const draggableElements = [...container.querySelectorAll('.draggableQueue:not(.dragging), .draggablePlaylist:not(.dragging)')];

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
  let dropdown = document.querySelector(".actionmenudropdown");
  let songCard = document.querySelector(".activeactionmenu");
  if (dropdown != null && songCard != null) {
    //if the user clicked anywhere on the page except on the button or menu themselves 
    //(prevents dropdown immediately opening and closing on initial click)
    if (event == null) {
      songCard.style.removeProperty("background-color");
      songCard.classList.remove("activeactionmenu");
      dropdown.remove();
    } else if ((!songCard.querySelector(".actionbutton").contains(event.target) && !dropdown.contains(event.target))) {
      if(dropdown.querySelector(".playlistpopup") && dropdown.querySelector(".playlistpopup").contains(event.target)){
        return;
      }
      songCard.style.removeProperty("background-color");
      songCard.classList.remove("activeactionmenu");
      dropdown.remove();
    }
  }
}

//Perform an action based on the selected dropdown option on song card - add to queue or playlist or remove from queue
async function handleSongActionMenuOption(option, songCard) {
  let songQueue = [...queueList.querySelectorAll("li")];
  let selectedSongId = songCard.querySelector(".songname").getAttribute("songid");
  let currentSong;
  let copy = songCard.cloneNode(true);

  switch (option.toLowerCase()) {
    case "play next":
      removeOpenDropDowns();
      copy = songCard.cloneNode(true);
      copy.classList.add("draggableQueue");
      copy.setAttribute("draggable", "true"); 
      copy.querySelector(".tracklistitem").classList.remove("queuecurrent");
      copy.querySelector(".tracklistitem").classList.remove("queuehistory");
      copy.classList.remove("activeactionmenu");
      copy.style.removeProperty("background-color");
      //if the queue is empty
      if(nowPlayingInfo.queue.length == 0){
        queueList.appendChild(copy);
        nowPlayingInfo.queue.push(selectedSongId);
        currentSong = queueList.querySelector("li");
        nowPlayingInfo.currentSongIndex = 0;
      } else { 
        currentSong = queueList.querySelector(".queuecurrent").closest("li");
        queueList.insertBefore(copy, queueList.children[nowPlayingInfo.currentSongIndex + 1]);
        nowPlayingInfo.queue.splice(nowPlayingInfo.currentSongIndex+1, 0, selectedSongId);
      }

      updateQueueAppearance(currentSong, false);
      addQueueEventListeners(copy);
      removeOpenDropDowns();
      break;
    case "add to queue":
      removeOpenDropDowns();
      copy.classList.add("draggableQueue");
      copy.setAttribute("draggable", "true");
      //dont need to do full queue update, as this item is always going at the end we can reliably handle its styles
      if(queueList.childElementCount > 0){
        copy.querySelector(".tracklistitem").classList.remove("queuecurrent");
      } else {
        copy.querySelector(".tracklistitem").classList.add("queuecurrent");
      }
      copy.querySelector(".tracklistitem").classList.remove("queuehistory");
      copy.classList.remove("activeactionmenu");
      copy.style.removeProperty("background-color");

      queueList.appendChild(copy);
      nowPlayingInfo.queue.push(selectedSongId);

      //only add event listeners to the 'copy' item to prevent dupes
      addQueueEventListeners(copy);
      removeOpenDropDowns();
      break;
    case "add to playlist":
      if(document.querySelector(".playlistpopup")){
        document.querySelector(".playlistpopup").remove();
      }else {
        await actionMenuRevealPlaylists();
      }
      break;
    case "remove from queue":
      removeOpenDropDowns();
      //if you removed the current item, reassign and skip if there are more, otherwise pause
      if(songCard.querySelector(".tracklistitem").classList.contains("queuecurrent")){
        if(nowPlayingInfo.queue.length > 1){
          //either there are only historic elements, only future elements, or both
          //in which case we must; make the previous element current, make a future element current, or make a future element current
          songCard.remove(); //remove from DOM
          songQueue.splice(nowPlayingInfo.currentSongIndex, 1); //remove from reference array
          nowPlayingInfo.queue.splice(nowPlayingInfo.currentSongIndex, 1); //remove from playing queue

          let newCurrentSongIndex = Math.min(nowPlayingInfo.currentSongIndex, nowPlayingInfo.queue.length-1);
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
      removeOpenDropDowns();
      break;
    case "remove from playlist":
      removeOpenDropDowns();
      let playlistId = playlistWindowHeader.getAttribute("playlistid")

      const deleteSongFromPlaylistUrl = "http://localhost:3000/playlists/song";

        const options = {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            playlistId: playlistId,
            songId: selectedSongId
          }),
        };

        let response = await fetch(deleteSongFromPlaylistUrl, options);

        //reload
        if (response.status == 200) {
          //api call to fetch songs in playlist
          playlistSongList.innerHTML = await loadPlaylistSongs(playlistId);

          //add event listeners to the newly generated html
          let songNameLinks = playlistSongList.querySelectorAll('.songname');
          let artistNameLinks = playlistSongList.querySelectorAll('.artistname');
          
          addSongAndArtistEventListeners(songNameLinks, artistNameLinks);
          addActionMenuEventListeners(playlistSongList.querySelectorAll(".actionbutton"));

        }
      break;
  }
}

//Perform an action based on the selected dropdown option on playlist card - add contents to queue or edit playlist
async function handlePlaylistActionMenuOption(option, card) {
  removeOpenDropDowns();
  let playlistLink = card.querySelector(".playlistname")
  let playlistName = playlistLink.innerText;
  let playlistId = playlistLink.getAttribute("playlistid");
  let currentSong;
  const template = document.createElement('template');

  switch (option.toLowerCase()) {
    case "play next":
      removeOpenDropDowns();
      //get list of songs on playlist by calling api
      template.innerHTML = await loadPlaylistSongs(playlistId);
      if(nowPlayingInfo.queue.length == 0){
        [...template.content.children].forEach(child => {
          child.classList.add("draggableQueue");
          child.setAttribute("draggable", "true"); 
          queueList.appendChild(child);
          nowPlayingInfo.queue.push(child.querySelector(".songname").getAttribute("songid"));
        });
        currentSong = queueList.children[0];
        nowPlayingInfo.currentSongIndex = 0;
      } else {
        currentSong = queueList.querySelector(".queuecurrent").closest("li");
        let insertBeforeElement = queueList.children[nowPlayingInfo.currentSongIndex + 1];
        let i = 0;
        [...template.content.children].forEach(child => {
          child.classList.add("draggableQueue");
          child.setAttribute("draggable", "true"); 
          queueList.insertBefore(child, insertBeforeElement);
          i++
          nowPlayingInfo.queue.splice(nowPlayingInfo.currentSongIndex+i, 0, child.querySelector(".songname").getAttribute("songid"));
        });
      }
      updateQueueAppearance(currentSong, false);
      addQueueEventListeners(queueList);
      removeOpenDropDowns();
      break;

    case "add to queue":
      removeOpenDropDowns();
      template.innerHTML = await loadPlaylistSongs(playlistId);
      let initialLength = queueList.childElementCount;
      [...template.content.children].forEach(child => {
        child.classList.add("draggableQueue");
        child.setAttribute("draggable", "true");
        queueList.appendChild(child);
        nowPlayingInfo.queue.push(child.querySelector(".songname").getAttribute("songid"));
      });
      if(initialLength == 0){
        queueList.firstElementChild.querySelector(".tracklistitem").classList.add("queuecurrent");
      }

      addQueueEventListeners(queueList);
      removeOpenDropDowns();
      break;
      
    case "rename playlist":
      //get new name
      let newPlaylistName = prompt("Enter playlist name (up to 15 characters):");
      if(!newPlaylistName || newPlaylistName.trim().length == 0){return;} 
      while(newPlaylistName.length > 15){
        newPlaylistName = prompt(`Name too long! (${newPlaylistName.length} characters). Enter a different name with less than 15 characters:`);
      }
      if(!newPlaylistName || newPlaylistName.trim().length == 0 ){return;} 

      //if name is valid, proceed
      if (newPlaylistName != null && newPlaylistName != "" && newPlaylistName != playlistName) {
        const playlistsUrl = "http://localhost:3000/playlists";

        const options = {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: playlistId,
            name: newPlaylistName
          }),
        };

        let response = await fetch(playlistsUrl, options);
        let data = await response.json();

        //reload playlists
        if (response.status == 200) {
          try {
            let playlistListItems = await loadPlaylists();
            playlistList.innerHTML = playlistListItems;
          } catch(error) {
            console.error("Error fetching playlists:\n" + error);
          }
          //add event listeners - clicks and action menus 
          addPlaylistEventListeners();
          //scroll to newly created
          playlistList.querySelector(`.playlistname[playlistid="${data.updatedPlaylist.id}"]`).scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        }
      }
      break;
    case "delete playlist":
      //are you sure?
      if(confirm(`Are you sure you want to delete playlist "${playlistName}"?`)){
        const playlistsUrl = "http://localhost:3000/playlists/";

        const options = {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: playlistId
          }),
        };

        let response = await fetch(playlistsUrl, options);
        if (response.status == 200) {
          card.remove();
        }

      }
      break;
    case "shuffle playlist":
      removeOpenDropDowns();
      template.innerHTML = await loadPlaylistSongs(playlistId);
      //set a random song as the first one, so when fisher yates is applied by shufflesongqueue(), we dont always end up with the same first song
      let firstChild = template.content.firstElementChild;
      template.content.insertBefore(firstChild, template.content.children[Math.floor(Math.random() * (nowPlayingInfo.queue.length-1))+1]);

      //empty queue
      shuffleIcon.classList.remove("toggledon");
      queueList.innerHTML = "";
      nowPlayingInfo.queue = [];
      nowPlayingInfo.currentSongIndex = 0;

      //similar to add playlist to queue for empty queue
      [...template.content.children].forEach(child => {
        child.classList.add("draggableQueue");
        child.setAttribute("draggable", "true");
        queueList.appendChild(child);
        nowPlayingInfo.queue.push(child.querySelector(".songname").getAttribute("songid"));
      });
      queueList.firstElementChild.querySelector(".tracklistitem").classList.add("queuecurrent");
      addQueueEventListeners(queueList);

      //shuffle the queue and start playing the first song
      shuffleSongQueue();
      playSong(nowPlayingInfo.queue[nowPlayingInfo.currentSongIndex]);
      removeOpenDropDowns();
      break;
  }
  removeOpenDropDowns();
}

//switch between artist and song libraries
function toggleLibrary(toSongs = false) {
  if ((toggleLibraryButton.getAttribute("status") == "tosongs") || toSongs){
    toggleLibraryButton.setAttribute("status", "toartists");
    toggleLibraryButton.innerText = "Artists";
    artistList.style.display = "none";
    songList.style.display = "initial";
  } else {
    toggleLibraryButton.setAttribute("status", "tosongs");
    toggleLibraryButton.innerText = "Songs";
    songList.style.display = "none";
    artistList.style.display = "initial";
  }
}

  // Function to scroll the container based on mouse position
  function handleScroll(container, event) {
    const containerRect = container.getBoundingClientRect();
    const buffer = 50; // Distance from the edges to trigger scrolling
    const maxScrollSpeed = 30; // Max scroll speed
    const minScrollSpeed = 5;  // Min scroll speed

    // Calculate scroll speed based on the distance to the top or bottom edge
    const distanceFromTop = event.clientY - containerRect.top;
    const distanceFromBottom = containerRect.bottom - event.clientY;

    let scrollSpeed = 0;

    // If near the top of the container
    if (distanceFromTop < buffer) {
      scrollSpeed = (buffer - distanceFromTop) / buffer * maxScrollSpeed;
    }
    // If near the bottom of the container
    else if (distanceFromBottom < buffer) {
      scrollSpeed = (buffer - distanceFromBottom) / buffer * maxScrollSpeed;
    }

    // Apply scroll if speed is greater than a minimum threshold
    if (scrollSpeed > minScrollSpeed) {
      container.scrollTop += (distanceFromTop < buffer ? -scrollSpeed : scrollSpeed);
    }
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
                      <a class="songname" draggable=false songId ="${song.id}">${song.name}</a>
                      <br>
                      <a class="artistname songsearchlink">${song.artist_name}</a>
                    </div>
                  </div>
                  <div class="actionmenucontainer">
                    <button class="actionbutton">
                      <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" focusable="false" class="actionbuttonicon">
                        <path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"></path>
                      </svg>
                    </button>
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
                      <a class="artistname songsearchlink">${artist.artist_name}</a>
                    </div>
                  </div>
                </div>
              </li>`;
  });
  return listItems;
}

//get playlists from database and turn into blocks of html
async function loadPlaylists() {
  const getAllPlaylistsUrl = "http://localhost:3000/playlists";
  let listItems = "";
  let response = await fetch(getAllPlaylistsUrl);
  let data = await response.json();
  data.playlists.forEach(playlist => {
    //add each to the block of html we will add
    listItems += 
            `<li>
          <div class="tracklistitem">
            <div class="trackdetailscontainer">
              <div class="overflowwrapper">
                <a class="playlistname" playlistid="${playlist.id}">${playlist.name}</a>
                <span class="playlistlength">${playlist.length} songs</span>
              </div>
            </div>
            <div class="actionmenucontainer">
              <button class="actionbutton">
                <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" focusable="false" class="actionbuttonicon">
                  <path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"></path>
                </svg>
              </button>
            </div>
          </div>
        </li>`
  });
  return listItems;
}

async function loadPlaylistSongs(playlistId) {
  const getPlaylistSongsUrl = "http://localhost:3000/playlists/songs/" + playlistId;
  let listItems = "";
  let response = await fetch(getPlaylistSongsUrl);
  let data = await response.json();

  data.songs.forEach(song => {
    //add each to the block of html we will add
    listItems +=
              `<li class="draggablePlaylist" draggable="true">
                <div class="tracklistitem">
                  <div class="trackdetailscontainer">
                    <div class="overflowwrapper">
                      <a class="songname" draggable=false songId ="${song.id}">${song.name}</a>
                      <br>
                      <a class="artistname songsearchlink">${song.artist_name}</a>
                    </div>
                  </div>
                  <div class="actionmenucontainer">
                    <button class="actionbutton">
                      <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" focusable="false" class="actionbuttonicon">
                        <path d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"></path>
                      </svg>
                    </button>	
                  </div>
                </div>
              </li>`;
  });
  return listItems;
}

async function createPlaylist() {
  
  let playlistName = prompt("Enter playlist name (up to 15 characters):");
  if(!playlistName || playlistName.trim().length == 0){return;} 
  while(playlistName.length > 15){
    playlistName = prompt(`Name too long! (${playlistName.length} characters). Enter a different name with less than 15 characters:`);
  }
  if(!playlistName || playlistName.trim().length == 0 ){return;} 


  const playlistsUrl = "http://localhost:3000/playlists";

  const options = { 
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: playlistName
    }),
  };

  let response = await fetch(playlistsUrl, options);
  let data = await response.json();
  if (response.status == 201) {
    try {
      let playlistListItems = await loadPlaylists();
      playlistList.innerHTML = playlistListItems;
    } catch(error) {
      console.error("Error fetching playlists:\n" + error);
    }
    //add event listeners - clicks and action menus 
    addPlaylistEventListeners();
    //scroll to newly created
    playlistList.querySelector(`.playlistname[playlistid="${data.createdPlaylist.id}"]`).scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
  }
}

function generateActionMenu(type) {
  const template = document.createElement('template');
  switch(type.toLowerCase()){
    case "songs":
      template.innerHTML = `<div class="actionmenudropdown">
                <div class="actionmenuoption" data-option="Play next"><span>Play next</span></div>
                <div class="actionmenuoption" data-option="Add to queue"><span>Add to queue</span></div>
                <div class="actionmenuoption" data-option="Add to playlist"><span>Add to playlist</span></div>
              </div>`;
      break;
    case "playlists":
      template.innerHTML = `<div class="actionmenudropdown">
                <div class="actionmenuoption" data-option="Play next"><span>Play next</span></div>
                <div class="actionmenuoption" data-option="Add to queue"><span>Add to queue</span></div>
                <div class="actionmenuoption" data-option="Shuffle playlist"><span>Shuffle playlist</span></div>
                <div class="actionmenuoption playlistoption" data-option="Rename playlist"><span>Rename playlist</span></div>
                <div class="actionmenuoption playlistoption" data-option="Delete playlist"><span>Delete playlist</span></div>
              </div>`;
      break;
    case "playlistsongs":
      template.innerHTML = `<div class="actionmenudropdown">
                <div class="actionmenuoption" data-option="Play next"><span>Play next</span></div>
                <div class="actionmenuoption" data-option="Add to queue"><span>Add to queue</span></div>
                <div class="actionmenuoption" data-option="Remove from playlist"><span>Remove from playlist</span></div>
                <div class="actionmenuoption" data-option="Add to playlist"><span>Add to playlist</span></div>
              </div>`;
      break;
    case "songqueue":
      template.innerHTML = `<div class="actionmenudropdown">
                <div class="actionmenuoption" data-option="Play next"><span>Play next</span></div>
                <div class="actionmenuoption" data-option="Add to queue"><span>Add to queue</span></div>
                <div class="actionmenuoption queueoption" data-option="Remove from queue"><span>Remove from queue</span></div>
                <div class="actionmenuoption" data-option="Add to playlist"><span>Add to playlist</span></div>
              </div>`;
      break;
  }
  return template.content.firstElementChild;
}

async function actionMenuRevealPlaylists() {
  let menuOption = document.querySelector(".actionmenuoption[data-option='Add to playlist']");
  const template = document.createElement('template');
  template.innerHTML = `<div class="playlistpopup"></div>`;
  menuOption.appendChild(template.content.firstElementChild);
  let playlistPopup = menuOption.querySelector(".playlistpopup");
  playlistPopup.innerHTML = await presentPlaylistsAsList(); 
  
  //orient popup based on where on the screen it is
  let parentDimensions = playlistPopup.closest(".actionmenuoption").getBoundingClientRect();
  let hoz;
  let vert;
  //left or right
  if(parentDimensions.left < window.innerWidth/2){
    hoz = parentDimensions.width - 15;
  } else {
    hoz = -(parentDimensions.width + 13);
  }
  //up or down
  if (parentDimensions.bottom > window.innerHeight/2) {
    vert = -189;
  } else {
    vert = -34;
  }
  playlistPopup.style.transform = `translate(${hoz}px, ${vert}px)`;
  
  playlistPopup.querySelectorAll(".playlistoption").forEach(option => {
    option.addEventListener('click', async function (event) {
      let playlistId = event.currentTarget.getAttribute('playlistid');
      let songId = document.querySelector(".activeactionmenu").querySelector(".songname").getAttribute("songid");
      let response = await addSongToPlaylist(songId, playlistId);
      if(response.status == 201) {
        //if we are currently looking at the songs in this playlist, we should see it visually update to include this new one
        if(playlistWindowHeader.getAttribute("playlistid") == playlistId){

          //api call to fetch songs in playlist
          playlistSongList.innerHTML = await loadPlaylistSongs(playlistId);

          //add event listeners to the newly generated html
          let songNameLinks = playlistSongList.querySelectorAll('.songname');
          let artistNameLinks = playlistSongList.querySelectorAll('.artistname');
          
          addSongAndArtistEventListeners(songNameLinks, artistNameLinks);
          addActionMenuEventListeners(playlistSongList.querySelectorAll(".actionbutton"));
        }
      }
    });
  });
}

async function presentPlaylistsAsList(){
  const getAllPlaylistsUrl = "http://localhost:3000/playlists";
  let listItems = "";
  let response = await fetch(getAllPlaylistsUrl);
  let data = await response.json();
  data.playlists.forEach(playlist => {
    //add each to the block of html we will add
    listItems += 
            `<div class="playlistoption" playlistid="${playlist.id}">${playlist.name}</div>`;
  });
  return listItems;
}

async function addSongToPlaylist(songId, playlistId) {
  const addToPlaylistUrl = "http://localhost:3000/playlists/addSong";

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      playlistId: playlistId,
      songId: songId
    }),
  };
    
  return await fetch(addToPlaylistUrl, options);
}

async function updatePlaylistSongPosition(songId, playlistId, position) {
  position += 1; //array position to regular numeric order
  const updateSongInPlaylistUrl = "http://localhost:3000/playlists/songs";
  const options = { 
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      songId: songId,
      playlistId: playlistId,
      position: position
    }),
  };

  await fetch(updateSongInPlaylistUrl, options);
}






//SONG CONTROLS
//when a song needs to begin playing (due to song end, resume, new queue etc)
async function playSong(id) {
  const getSongDetailsUrl = "http://localhost:3000/songs/" + id; //use song id to get details
  let response = await fetch(getSongDetailsUrl);
  let data = await response.json();
  //make strings appropriate for browser & static reference
  let filepath = 'http://localhost:3000/' + encodeURIComponent(data.filepath.slice(data.filepath.lastIndexOf("\\") + 1));
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
  //display now playing song in browser tab
  tabTitle.innerText = data.name + " - " + data.artist_name;
  //if we are still in playing state, dont toggle to off state - we are likely in the middle of a queue.
  if (playButton.getAttribute('status') == "playing") {
    nowPlayingInfo.song.volume = volumeSlider.value;
    await nowPlayingInfo.song.play();
  } else {
    await togglePlayButton();
  }
  await incrementSongPlays(data.id, data.number_of_plays);
  addSongEventListeners();
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
  let parentSongList = songNameLink.closest("ul");
  let allSongs = parentSongList.querySelectorAll('li'); 
  let currentSongIndex = Array.prototype.indexOf.call(allSongs, songNameLink.closest('li')); //how far down the list of all songs is the selected one?
  let currentSongId = allSongs[currentSongIndex].querySelector('.songname').getAttribute("songid");

  //using all songs that are visible in the current search field, form a queue
  for (let i = 0; i < allSongs.length; i++) {
    if (allSongs[i].style.display != "none") {
      nowPlayingInfo.queue.push(allSongs[i].querySelector('.songname').getAttribute("songid"));
    }
  }
  
  nowPlayingInfo.currentSongIndex = nowPlayingInfo.queue.indexOf(currentSongId); //updated index among only visible songs. id will be unique as we are taking from playlist or library
  //populate queue window with list items
  queueList.innerHTML = "" //clear current queue
  let listItems = generateQueueListItems(parentSongList);
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
      nowPlayingInfo.currentSongIndex = Array.prototype.indexOf.call(queueList.children, currentSongListItem);
      updateQueueAppearance(currentSongListItem);
    }
    shuffleIcon.classList.remove("toggledon");
  } else if(queueList.childElementCount > 0){ //shuffle
    //shuffle queue array and list items simultaneously as they should be in the same order
    let queueListItems = [...queueList.children];
    let queueIndex = nowPlayingInfo.queue.length -1; //because we plan to splice out current song
    let queueListIndex = queueListItems.length -1; 
    let randomIndex;

    //store original queue ordering in unshuffled
    nowPlayingInfo.unshuffledQueueList = [...queueList.children];
    nowPlayingInfo.unshuffledQueue = [...nowPlayingInfo.queue];

    //take note of currently playing song, to end up at the top of the queue
    let currentSongId = queueList.querySelector(".queuecurrent").querySelector(".songname").getAttribute("songid");

    //if queue and list represenation are synced up, shuffle both in parallel
    if(queueIndex == queueListIndex && queueListIndex > 0){
      let currentSongElement = queueListItems.splice(nowPlayingInfo.currentSongIndex, 1);
      nowPlayingInfo.queue.splice(nowPlayingInfo.currentSongIndex, 1);
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
      nowPlayingInfo.currentSongIndex = 0;
      let currentSongListItem = queueList.querySelector(".queuecurrent").closest("li");
      updateQueueAppearance(currentSongListItem);
      shuffleIcon.classList.add("toggledon");
    }
  } else {
    shuffleIcon.classList.add("toggledon");
  }
}

//Create copies of song cards to populate new queue and add relevant classes for styling.
function generateQueueListItems(queueSource) {
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
    if (i == nowPlayingInfo.currentSongIndex) {
      newList[i].querySelector(".tracklistitem").classList.add("queuecurrent");
    } else if (i < nowPlayingInfo.currentSongIndex) {
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

async function incrementSongPlays(id, number_of_plays) {
  const songsUrl = "http://localhost:3000/songs";
  number_of_plays += 1;

  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: id,
      number_of_plays: number_of_plays
    }),
  };

  await fetch(songsUrl, options);
}


return{}
})();







