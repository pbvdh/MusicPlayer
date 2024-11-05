# MusicPlayer
Desktop music player for all my unsorted MP3 files. A user will be able to add and remove MP3 files locally, organize and play them.

As the purpose of this is in part to practice my development skills, I will design the architecture to allow me to try a bunch of different stuff.

Plan:
- MP3s will be stored in a server folder but their file paths will be tracked with a DB 
- This will also track other information such as playlists and artists
- The application will make RESTful API calls to retrieve this information (using node.js)
- The application will simply be accessed through a web browser, locally hosted, as I aim to practice UI test automation on it in the future.


Additional Tools used
- Visual studio for development
- Postman to test POST requests
- DB Browser for SQL lite for formulating queries

To Do
- add backup stylings to handle broken images, accessibility text
- write api documentation
- add hovers for songs with long names
- test to hone API error codes
- env file for port number and other variables
- test in other browsers
- persist current song/queue when refreshed and sensible defaults
- tracking # plays and ability to sort

playlists
- length restriction on playlistname (enforce in sql, error checking etc) - 15?
- change font
- TODO if current playlist is open in playlists window: update appearance when u add a song to the playlist.
- playlist action menu options (add to queue)
- action menu options for songs on playlist should be different to playlist acitons.
- reorder playlist
