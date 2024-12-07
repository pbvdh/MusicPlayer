const sqlite3 = require('sqlite3').verbose();
const dbPath = process.env.DATABASE_URL;

//database information
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(err.message);
    } else {
        return console.log("Connected to the database");
    }
});

module.exports = db;