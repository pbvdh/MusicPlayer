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
- make it look nice in chrome, safari
- persist current song/queue when refreshed and sensible defaults
- stylized modal instead of alert/prompt
- shuffle all songs option?

prio
- allow reorder playlist by dragging (if using a new class, this needs to be removed just like queuecurrent etc)
- allow sort songs by plays
- allow shuffle all songs
