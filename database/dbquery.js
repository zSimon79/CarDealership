import connectionPool from './dbinit.js'; // Import the connection pool

// Create a Listing
async function createListing({ brand, city, price, date, userId }) {
  const sql = `
        INSERT INTO Autok (marka, varos, ar, datum, felhasznaloID)
        VALUES (?, ?, ?, ?, ?);
    `;
  const [result] = await connectionPool.execute(sql, [brand, city, price, date, userId]);
  return result.insertId; // Return the ID of the newly created listing
}

// Get All Listings
async function getAllListings() {
  const sql = 'SELECT * FROM Autok;';
  const [rows] = await connectionPool.query(sql);
  return rows;
}

async function getListingById(listingId) {
  const sql = 'SELECT * FROM Autok WHERE autoID = ?;';
  const [rows] = await connectionPool.execute(sql, [listingId]);
  return rows[0];
}

// Update a Listing
async function updateListing({ listingId, brand, city, price, date }) {
  const sql = `
        UPDATE Autok
        SET marka = ?, varos = ?, ar = ?, datum = ?
        WHERE autoID = ?;
    `;
  await connectionPool.execute(sql, [brand, city, price, date, listingId]);
}

// Delete a Listing
async function deleteListing(listingId) {
  const sql = 'DELETE FROM Autok WHERE autoID = ?;';
  await connectionPool.execute(sql, [listingId]);
}

// Create a User
async function createUser(name) {
  const sql = 'INSERT INTO Felhasznalok (nev) VALUES (?);';
  const [result] = await connectionPool.execute(sql, [name]);
  return result.insertId;
}

async function deleteUser(userId) {
  const sql = 'DELETE FROM Felhasznalok WHERE felhasznaloID = ?;';
  await connectionPool.execute(sql, [userId]);
}

async function getAllUsers() {
  const sql = 'SELECT * FROM Felhasznalok;';
  const [rows] = await connectionPool.query(sql);
  return rows;
}

// Add an Image to a Listing
async function addImageToListing({ listingId, filename }) {
  const sql = `
        INSERT INTO Kep (autoID, fajlnev)
        VALUES (?, ?);
    `;
  await connectionPool.execute(sql, [listingId, filename]);
}

async function getImagesByCarId(listingId) {
  const sql = 'SELECT fajlnev FROM Kep WHERE autoID = ?;';
  const [rows] = await connectionPool.execute(sql, [listingId]);
  return rows;
}

async function searchListings(filters) {
  let query = 'SELECT * FROM Autok WHERE 1 = 1';
  const params = [];

  if (filters.marka) {
    query += ' AND marka LIKE ?';
    params.push(`%${filters.marka}%`);
  }
  if (filters.varos) {
    query += ' AND varos LIKE ?';
    params.push(`%${filters.varos}%`);
  }
  if (filters.minAr) {
    query += ' AND ar >= ?';
    params.push(filters.minAr);
  }
  if (filters.maxAr) {
    query += ' AND ar <= ?';
    params.push(filters.maxAr);
  }
  if (filters.datum) {
    query += ' AND datum <= ?';
    params.push(filters.datum);
  }

  const [results] = await connectionPool.execute(query, params);
  return results;
}

export {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  createUser,
  getAllUsers,
  deleteUser,
  addImageToListing,
  getImagesByCarId,
  searchListings,
};
