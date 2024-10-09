function init() {
  /*event listeners for DOM*/
  let artistNameLinks = document.getElementsByClassName("songsearchlink");
  let togglePanes = document.getElementById("nowplayingimage");
  let clearSongSearch = document.getElementById("searchsongsclearbutton");
  let songSearchInput = document.getElementById("searchsongs");
  let trackSlider = document.getElementById("trackslider");
	let playbackPositionValue = document.getElementById("playbackposition");
  let songList = document.getElementById("songlist");

  for(i=0; i<artistNameLinks.length; i++){
    artistNameLinks[i].addEventListener('click', function() {
      searchLinkedTrack(this);
    });
  }
  
  togglePanes.addEventListener('click', function() {
    showHidePanes();
  });

  clearSongSearch.addEventListener('click', function() {
    clearInput(songSearchInput)
  });

  songSearchInput.addEventListener('input', function() {
    searchSongByName()
  });

  playbackPositionValue.innerHTML =  Math.floor(trackSlider.value / 60) + ":" + String(trackSlider.value % 60).padStart(2, '0');
  trackSlider.addEventListener('input', function() {
    playbackPositionValue.innerHTML =  Math.floor(this.value / 60) + ":" + String(this.value % 60).padStart(2, '0');
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
    const A = a.textContent, B = b.textContent;
    return (A < B) ? -1 : (A > B) ? 1 : 0;
  });
  


  window.onload=init;