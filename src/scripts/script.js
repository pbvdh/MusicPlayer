function searchSongByName() {
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('searchsongs');
    filter = input.value.toLowerCase();
    ul = document.getElementById("songlist");
    li = ul.getElementsByTagName('li');
  
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