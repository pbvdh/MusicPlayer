import json
import requests


#use our scraped json file of mp3 metadata and use our own api to write these to the database
with open('listofmp3s.json', 'r') as file:
    data = json.load(file)

url = "http://localhost:3000/songs"

for song in data:
    x = requests.post(url, json = song)

print("Done! Uploaded " + str(len(data)) + " songs.")
