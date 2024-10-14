BEGIN TRANSACTION;
DROP TABLE IF EXISTS "playlist";
CREATE TABLE "playlist" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "song";
CREATE TABLE "song" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"filepath"	TEXT NOT NULL UNIQUE,
	"number_of_plays"	INTEGER NOT NULL DEFAULT 0,
	"genre"	TEXT NOT NULL,
	"duration_seconds"	REAL NOT NULL,
	"artist_name"	TEXT,
	UNIQUE("artist_name","name"),
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "song_in_playlist";
CREATE TABLE "song_in_playlist" (
	"song_id"	INTEGER,
	"playlist_id"	INTEGER,
	"position"	INTEGER NOT NULL,
	UNIQUE("playlist_id","position"),
	PRIMARY KEY("song_id","playlist_id"),
	FOREIGN KEY("playlist_id") REFERENCES "playlist"("id"),
	FOREIGN KEY("song_id") REFERENCES "song"("id")
);
COMMIT;
