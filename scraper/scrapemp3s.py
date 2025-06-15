import os
import json
from tinytag import TinyTag 

 #loop through mp3 files in server directory, and record the metadata we want to use to form our records in the database
mp3Files = []

directory = ("../mp3_library")
for name in os.listdir(directory):
    if name.endswith('.mp3'):   
        filepath = os.path.join(directory, name)
        file = TinyTag.get(filepath)
        filename = file.title
        #some songs have no title metadata, relying on filename. So if this is the case, we extract that instead
        if filename is None:
            filename = filepath[filepath.rindex("\\")+1:filepath.rindex(".")]
        if file.artist is None:
            file.artist = "Unknown"
        audio = {
            "name": filename,
            "filepath": filepath,
            "duration_seconds": file.duration,
            "artist_name": file.artist,
            "genre": ""
        }
        mp3Files.append(audio)

#write our data to a json file
f = open("listofmp3s.json", "w")
string = json.dumps(mp3Files, indent=2)
f.write(string)
f.close()
