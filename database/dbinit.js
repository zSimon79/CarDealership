import mysql2 from 'mysql2/promise.js';

const connectionPool = mysql2.createPool({
  connectionLimit: 10,
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
        felhasznaloID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nev VARCHAR(100) NOT NULL UNIQUE,
        hash_jelszo VARCHAR(100) NOT NULL,
        szerep ENUM('admin', 'vendeg', 'felhasznalo') NOT NULL DEFAULT 'vendeg'
      );
    `;
  await connectionPool.query(sql);
}

export async function createTableListings() {
  const sql = `
      CREATE TABLE IF NOT EXISTS Autok (
        autoID INT AUTO_INCREMENT PRIMARY KEY,
        marka VARCHAR(50) NOT NULL,
        model VARCHAR(100) NOT NULL,
        varos VARCHAR(50) NOT NULL,
        motor VARCHAR(50) NOT NULL,
        ar FLOAT NOT NULL,
        datum DATE NOT NULL,
        felhasznaloID INT,
        FOREIGN KEY (felhasznaloID) REFERENCES Felhasznalok(felhasznaloID) ON DELETE CASCADE
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
        FOREIGN KEY (autoID) REFERENCES Autok(autoID) ON DELETE CASCADE
      );
    `;
  await connectionPool.query(sql);
}

export async function createTableOffers() {
  const sql = `
    CREATE TABLE IF NOT EXISTS ajanlatok (
      id INT AUTO_INCREMENT PRIMARY KEY,
      autoId INT NOT NULL,
      ajanloId INT NOT NULL,
      tulajId INT NOT NULL,
      ar INT NOT NULL,
      statusz ENUM('elfogadva', 'elutasitva', 'folyamatban') NOT NULL DEFAULT 'folyamatban',
      FOREIGN KEY (autoId) REFERENCES autok(autoId) ON DELETE CASCADE,
      FOREIGN KEY (ajanloId) REFERENCES felhasznalok(felhasznaloId) ON DELETE CASCADE,
      FOREIGN KEY (tulajId) REFERENCES felhasznalok(felhasznaloId) ON DELETE CASCADE
    );
  `;
  await connectionPool.query(sql);
}

async function initializeDatabase() {
  try {
    await createTableUsers();
    await createTableListings();
    await createTableImages();
    await createTableOffers();
    console.log('All tables were created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

initializeDatabase();
