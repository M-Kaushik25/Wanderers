const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DATABASE_PATH || './wanderers.db', (err) => {
  if (!err) {
    db.run('PRAGMA foreign_keys = ON');
  }
});

module.exports = db;
