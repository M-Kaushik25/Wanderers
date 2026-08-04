require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database(process.env.DATABASE_PATH || './wanderers.db');

// Enable foreign keys in SQLite
db.run('PRAGMA foreign_keys = ON');

db.serialize(() => {
  // Drop tables if they exist to apply the new schema cleanly
  db.run(`DROP TABLE IF EXISTS bookings`);
  db.run(`DROP TABLE IF EXISTS packages`);
  db.run(`DROP TABLE IF EXISTS users`);
  db.run(`DROP TABLE IF EXISTS admins`);

  // Table: users
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table: packages
  db.run(`
    CREATE TABLE packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      destination TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      price REAL NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table: bookings (Junction with foreign keys and cascade)
  db.run(`
    CREATE TABLE bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      package_id INTEGER NOT NULL,
      booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      travel_date DATE NOT NULL,
      passengers INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
    )
  `);

  // Table: admins
  db.run(`
    CREATE TABLE admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed Data: Packages
  const stmt = db.prepare(`
    INSERT INTO packages (title, description, destination, duration_days, price, image_url) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run('Tropical Paradise', 'Relax on the beautiful beaches of Bali.', 'Bali, Indonesia', 7, 899.00, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80');
  stmt.run('Alpine Adventure', 'Experience the thrill of the Swiss Alps.', 'Swiss Alps', 5, 1200.00, 'https://images.unsplash.com/photo-1531366936337-77b5d038dc0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80');
  stmt.run('Cultural Japan', 'Immerse yourself in the rich culture of Kyoto.', 'Kyoto, Japan', 10, 1500.00, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80');
  stmt.finalize();

  // Insert default admin
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const saltRounds = 10;
  const hash = bcrypt.hashSync(adminPassword, saltRounds);
  db.run(`INSERT INTO admins (email, password) VALUES (?, ?)`, [adminEmail, hash]);

  console.log("Database initialized with strict schema, foreign keys, and seed data.");
});

db.close();
