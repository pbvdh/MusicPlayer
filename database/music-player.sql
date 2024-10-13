BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "playlist" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "song" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"filepath"	TEXT NOT NULL UNIQUE,
	"number_of_plays"	INTEGER NOT NULL DEFAULT 0,
	"genre"	TEXT NOT NULL,
	"duration_seconds"	INTEGER NOT NULL,
	"artist_name"	TEXT,
	UNIQUE("artist_name","name"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "song_in_playlist" (
	"song_id"	INTEGER,
	"playlist_id"	INTEGER,
	"position"	INTEGER NOT NULL,
	UNIQUE("playlist_id","position"),
	PRIMARY KEY("song_id","playlist_id"),
	FOREIGN KEY("playlist_id") REFERENCES "playlist"("id"),
	FOREIGN KEY("song_id") REFERENCES "song"("id")
);
COMMIT;
