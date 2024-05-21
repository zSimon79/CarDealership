import mysql2 from 'mysql2/promise.js';

const connectionPool = mysql2.createPool({
  connectionLimit: 10, // the maximum number of connections in the pool
  host: 'localhost',
  user: 'webprog',
  password: 'VgJUjBd8',
  database: 'webprog',
  port: 3306,
  waitForConnections: true,
});

export default connectionPool;

export async function createTableUsers() {
  const sql = `
      CREATE TABLE IF NOT EXISTS Felhasznalok (
        felhasznaloID INT AUTO_INCREMENT PRIMARY KEY,
        nev VARCHAR(100) NOT NULL
      );
    `;
  await connectionPool.query(sql);
}

export async function createTableListings() {
  const sql = `
      CREATE TABLE IF NOT EXISTS Autok (
        autoID INT AUTO_INCREMENT PRIMARY KEY,
        marka VARCHAR(50) NOT NULL,
        varos VARCHAR(50) NOT NULL,
        ar FLOAT NOT NULL,
        datum DATE NOT NULL,
        felhasznaloID INT,
        FOREIGN KEY (felhasznaloID) REFERENCES Felhasznalok(felhasznaloID)
      );
    `;
  await connectionPool.query(sql);
}

export async function createTableImages() {
  const sql = `
      CREATE TABLE IF NOT EXISTS Kep (
        kepID INT AUTO_INCREMENT PRIMARY KEY,
        autoID INT,
        fajlnev VARCHAR(255) NOT NULL,
        FOREIGN KEY (autoID) REFERENCES Autok(autoID)
      );
    `;
  await connectionPool.query(sql);
}

async function initializeDatabase() {
  try {
    await createTableUsers();
    await createTableListings();
    await createTableImages();
    console.log('All tables were created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

initializeDatabase();
