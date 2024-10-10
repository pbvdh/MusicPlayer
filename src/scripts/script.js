function init() {
  /*event listeners for DOM*/
  let songSearchLinks = document.querySelectorAll(".songsearchlink");
  let togglePanes = document.getElementById("nowplayingimage");
  let clearSongSearch = document.getElementById("searchsongsclearbutton");
  let songSearchInput = document.getElementById("searchsongs");
  let trackSlider = document.getElementById("trackslider");
	let playbackPositionValue = document.getElementById("playbackposition");
  let songList = document.getElementById("songlist");
  let actionbuttons = document.querySelectorAll(".actionbutton");
  const queueDraggables = document.querySelectorAll(".draggableQueue");
  const queuelist = document.getElementById("queuelist");

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
    clearInput(songSearchInput)
  });

  //handle searching for songs
  songSearchInput.addEventListener('input', function() {
    searchSongByName()
  });

  //update the current position value for the track slider
  playbackPositionValue.innerHTML =  Math.floor(trackSlider.value / 60) + ":" + String(trackSlider.value % 60).padStart(2, '0');
  trackSlider.addEventListener('input', function() {
    playbackPositionValue.innerHTML =  Math.floor(this.value / 60) + ":" + String(this.value % 60).padStart(2, '0');
  });


  //handle options menus on song panels
  actionbuttons.forEach(actionbutton => {
    actionbutton.addEventListener('click', function (){
      showActionMenu(actionbutton.parentElement.querySelector(".actionmenu"));
    });
  });


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


  function showActionMenu(actionmenu) {
    console.log("hi");
    if (actionmenu.className.indexOf("showmenu") == -1) {
      actionmenu.className += " showmenu";
    } else { 
      actionmenu.className = actionmenu.className.replace(" showmenu", "");
    }
  }

  window.onload=init;