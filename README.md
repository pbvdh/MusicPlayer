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

To Do
- add backup stylings to handle broken images, accessibility text
- write api documentation
- add hovers for songs with long names
- use test driven development to hone API error codes
- env file for port number and other variables
- scroll song name on hover
- search artists
- test in chrome
- persist current song/queue when refreshed and sensible defaults