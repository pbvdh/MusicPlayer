import os
import json
from tinytag import TinyTag 

 #loop through mp3 files in server directory, and record the metadata we want to use to form our records in the database
mp3Files = []

directory = ("../mp3_library")
for name in os.listdir(directory):
    filepath = os.path.join(directory, name)
    file = TinyTag.get(filepath)
    audio = {
        "name": file.title,
        "path": filepath,
        "duration": file.duration,
        "artist": file.artist
    }
    mp3Files.append(audio)

#write our data to a json file
f = open("./scraper/listofmp3s.json", "w")
string = json.dumps(mp3Files, indent=2)
f.write(string)
f.close()