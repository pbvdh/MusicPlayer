# MusicPlayer
Desktop music player for all my unsorted MP3 files. A user will be able to organize and play MP3 files hosted on the server.

As the purpose of this is in part to practice my development skills, I will design the architecture to allow me to try a bunch of different stuff (e.g. perhaps a relational database isn't strictly necessary to store playlists but its useful for practice)


Tools and languages used
- Visual studio for development
- Postman to test POST requests
- DB Browser for SQLite for formulating queries
- Node.js server environment
- JavaScript, HTML, CSS, SQL for building the application
- Python for scripts to set up music library (loading filepaths to database)
- Git for source control

Further work to consider
- add hovers for songs with long names
- support other browsers such as chrome and safari
- persist current song/queue when refreshed
- stylized modal instead of alert/prompt when creating a playlist
- UI and accessibility testing


How to use
1. Store any personal MP3 files in the folder "mp3_library". Ensure they have name and artist_name properties set.
2. Inside the "scraper" folder, run "scrapemp3s.py" to write all the information about your mp3 files (and their filepaths) to the json file.
3. Run "writemp3s.py" to write the information in the json file to the database ("music-player.db).
4. Now, you can run "startMusicPlayer.bat" to spin up the server (and navigate to http://localhost:3000/index). You will see that all your mp3 files should be loaded there as songs.
5. Enjoy! Use the application to create playlists and play your music. All changes will persist in the database.