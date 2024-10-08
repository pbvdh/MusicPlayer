//keyup search bar functionality
function searchSongByName() {
    // Declare variables
    let input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('searchsongs');
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

  function clearInput(id) {
    document.getElementById(id).value="";
    searchSongByName();
  }