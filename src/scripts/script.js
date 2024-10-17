let song;

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
	let playbackPositionValue = document.getElementById("playbackposition");
  let actionbuttons = document.querySelectorAll(".actionbutton");
  let actionmenuoptions = document.querySelectorAll(".actionmenuoption");
  let queueDraggables = document.querySelectorAll(".draggableQueue");
  let queuelist = document.getElementById("queuelist");
  let songNames = document.querySelectorAll(".songname");
  let playButton = document.getElementById("playbutton");

  //allow songs in queue to be dragged
  queueDraggables.forEach(draggable => {
    //add dragging class to an item when you start dragging it, after a delay
    draggable.addEventListener('dragstart', () => {
      setTimeout(() => draggable.classList.add('dragging'), 0);
    });
    //remove dragging class when you let go
    draggable.addEventListener('dragend', () => {
      draggable.classList.remove('dragging');
    });

    draggable.addEventListener('dragenter', () => {
      draggable.classList.add('over');
    });

    draggable.addEventListener('dragleave', () => {
      draggable.classList.remove('over');
    });
  });

  //handle a song getting dragged within the song queue
  queuelist.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(queuelist, e.clientY);
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
      queuelist.appendChild(draggable);
    } else {
      queuelist.insertBefore(draggable, afterElement);
    }
  });

  //if an the name of an artist is clicked within our app, we input it as a search
  songSearchLinks.forEach(songSearchLink => {
    songSearchLink.addEventListener('click', () => {
      searchLinkedTrack(songSearchLink);
    });
  });

  //if the now playing image is clicked, toggle display
  togglePanes.addEventListener('click', function() {
    showHidePanes();
  });

  //clear search window button
  clearSongSearch.addEventListener('click', function() {
    clearInput(songSearchInput);
  });

  //handle searching for songs
  songSearchInput.addEventListener('input', function() {
    searchSongByName();
  });

  //update the current position value for the track slider
  playbackPositionValue.innerHTML =  Math.floor(trackSlider.value / 60) + ":" + String(trackSlider.value % 60).padStart(2, '0');
  trackSlider.addEventListener('input', function() {
    playbackPositionValue.innerHTML =  Math.floor(this.value / 60) + ":" + String(this.value % 60).padStart(2, '0');
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
      playSong(songName.getAttribute('songid'), playButton);
    });
  });

  playButton.addEventListener('click', function() {
    togglePlayButton(this);
  });

  document.addEventListener('click', (event) => {
    //hide pop up options menus when you click outside them
    removeOpenDropDowns(event);
  });
  

  //sort lists of songs when app loads
  sortSongList(songList);								
}







//keyup search bar functionality
function searchSongByName() {
    // Declare variables
    let input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("searchsongs");
    filter = input.value.toLowerCase();
    ul = document.getElementById("songlist");
    li = ul.getElementsByTagName('li');
    clearText = document.getElementById("searchsongsclearbutton");

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
  function searchLinkedTrack(a){
    let searchTerm = a.textContent || a.innerText;
    let input = document.getElementById('searchsongs');
    input.value = searchTerm;
    showHidePanes(true);
    searchSongByName();
  }

  function clearInput(input) {
    input.value="";
    searchSongByName();
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

  async function playSong(id, playButton){
    const getSongDetailsUrl = "http://localhost:3000/songs/" + id; //use song id to get details
    let response = await fetch(getSongDetailsUrl);
    let data = await response.json();
    //make strings appropriate for browser & static reference
    let filepath = 'http://localhost:3000/' + encodeURIComponent(data.filepath.slice(data.filepath.lastIndexOf("\\")+1));
    let nowPlayingSong = document.getElementById('nowplayingsongname').getElementsByClassName('songsearchlink')[0];
    let nowPlayingArtist = document.getElementById('nowplayingartistname').getElementsByClassName('songsearchlink')[0];
    nowPlayingSong.innerText = data.name;
    nowPlayingArtist.innerText = data.artist_name;
    if(song){
      if (!song.paused) {
        await togglePlayButton(playButton);
      }
      song = null;
    };
    song = await new Audio(filepath);
    song.load();
    await togglePlayButton(playButton);
  }

  async function togglePlayButton (playButton) {
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
      await song.play();
    } else if (playButton.getAttribute('status') == "playing") {
      playButton.setAttribute('status', 'paused');
      playButtonInner.innerHTML = playIcon;
      await song.pause();
    }
  }


  window.onload=init;