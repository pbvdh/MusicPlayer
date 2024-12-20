# MusicPlayer
Desktop music player for all my unsorted MP3 files. A user will be able to organize and play MP3 files hosted on the server. Developed for Firefox browser.
As the purpose of this is in part to practice my development skills, I will design the architecture to allow me to try a bunch of different stuff (e.g. perhaps a relational database isn't strictly necessary to store playlists but its useful for me to practice).


How to use
1. Store any personal MP3 files in the folder "mp3_library". Ensure they have "Title" and "Contributing artists" properties set in the "Details" tab.
2. Inside the "scraper" folder, run "scrapemp3s.py" to write all the information about your mp3 files (and their filepaths) to the json file.
3. Run "writemp3s.py" to write the information in the json file to the database ("music-player.db).
4. Now, you can run "startMusicPlayer.bat" to spin up the server (and navigate to http://localhost:3000/index). You will see that all your mp3 files should be loaded there as songs.
5. Enjoy! Use the application to create playlists and play your music. Changes to playlists will persist in the database.

<br/>

Tools and languages used
- Visual studio for development
- Postman to test POST requests
- DB Browser for SQLite for formulating queries
- Node.js server environment
- JavaScript, HTML, CSS, SQL for building the application
- Python for scripts to set up music library (loading filepaths to database)
- Git for source control
- API endpoint for deleting all songs while preserving playlists


Further work
- Add hovers for songs with long names
- Improve appearance on chrome browser and support safari
- Persist current song/queue when page is refreshed
- Stylized modal instead of alert/prompt when creating a playlist
- UI and accessibility testing
- Handle errors outside main flow (e.g. what happens if mp3 file isnt found)


