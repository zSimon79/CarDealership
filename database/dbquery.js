import connectionPool from './dbinit.js';

async function createListing({ brand, model, city, motor, price, date, userId }) {
  const sql = `
        INSERT INTO Autok (marka, model, varos, motor, ar, datum, felhasznaloID)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
  const [result] = await connectionPool.execute(sql, [brand, model, city, motor, price, date, userId]);
  return result.insertId;
}

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

async function getListingOwner(listingId) {
  const sql = 'SELECT f.* FROM Autok a JOIN Felhasznalok f On a.felhasznaloID=f.felhasznaloID WHERE autoID = ?;';
  const [rows] = await connectionPool.execute(sql, [listingId]);
  return rows[0];
}

async function updateListing({ listingId, brand, model, city, motor, price, date }) {
  const sql = `
        UPDATE Autok
        SET marka = ?, model = ?, varos = ?, motor = ?, ar = ?, datum = ?
        WHERE autoID = ?;
    `;
  await connectionPool.execute(sql, [brand, model, city, motor, price, date, listingId]);
}

async function deleteListing(listingId) {
  const sql = 'DELETE FROM Autok WHERE autoID = ?;';
  await connectionPool.execute(sql, [listingId]);
}

async function createUser(name, hashPasswd) {
  const sql = 'INSERT INTO Felhasznalok (nev,hash_jelszo) VALUES (?, ?);';
  const [result] = await connectionPool.execute(sql, [name, hashPasswd]);
  return result.insertId;
}

async function deleteUser(userId) {
  const sql = 'DELETE FROM Felhasznalok WHERE felhasznaloID = ?;';
  await connectionPool.execute(sql, [userId]);
}

async function getAllUsers() {
  const sql = 'SELECT felhasznaloID, nev, szerep FROM Felhasznalok;';
  const [rows] = await connectionPool.query(sql);
  return rows;
}

async function findUserByUsername(name) {
  const sql = 'SELECT * FROM Felhasznalok WHERE nev = ?;';
  const [rows] = await connectionPool.execute(sql, [name]);
  return rows[0];
}

async function getUserPassword(name) {
  const sql = 'SELECT hash_jelszo FROM Felhasznalok WHERE nev = ?;';
  const [rows] = await connectionPool.execute(sql, [name]);
  return rows[0];
}

async function getUserById(userId) {
  const sql = 'SELECT * FROM Felhasznalok WHERE felhasznaloID = ?;';
  const [rows] = await connectionPool.execute(sql, [userId]);
  return rows[0];
}

async function addImageToListing({ listingId, filename }) {
  const sql = `
        INSERT INTO Kep (autoID, fajlnev)
        VALUES (?, ?);
    `;
  await connectionPool.execute(sql, [listingId, filename]);
}

async function getImageById(imageId) {
  const sql = 'SELECT * FROM Kep WHERE kepID = ?;';
  const [rows] = await connectionPool.execute(sql, [imageId]);
  return rows[0];
}

async function deleteImageById(imageId) {
  const sql = 'DELETE FROM Kep WHERE kepID = ?;';
  const [result] = await connectionPool.execute(sql, [imageId]);
  return result.affectedRows;
}

async function getImagesByCarId(listingId) {
  const sql = 'SELECT kepID, fajlnev FROM Kep WHERE autoID = ?;';
  const [rows] = await connectionPool.execute(sql, [listingId]);
  return rows.map((row) => ({
    id: row.kepID,
    fajlnev: row.fajlnev,
  }));
}

async function getImageOwner(imageId) {
  const sql =
    'SELECT f.* FROM kep k JOIN Autok a ON k.autoID=a.autoID JOIN Felhasznalok f On a.felhasznaloID=f.felhasznaloID WHERE kepID = ?;';
  const [rows] = await connectionPool.execute(sql, [imageId]);
  return rows[0];
}

async function createOffer({ listingId, offerorId, listerId, price }) {
  const sql = 'INSERT INTO ajanlatok (autoId, ajanloId, tulajId, ar) VALUES (?, ?, ?, ?);';
  const [result] = await connectionPool.execute(sql, [listingId, offerorId, listerId, price]);
  return result.insertId;
}

async function getOffersByCarId(listingId) {
  const sql = 'SELECT a.*, f.nev FROM ajanlatok a JOIN felhasznalok f ON a.ajanloId=f.felhasznaloId WHERE autoId = ?;';
  const [rows] = await connectionPool.execute(sql, [listingId]);
  return rows;
}

async function getOfferByOfferorId(userId) {
  const sql = 'SELECT * FROM ajanlatok WHERE ajanloId = ?;';
  const [rows] = await connectionPool.execute(sql, [userId]);
  return rows[0];
}

async function getOfferByListerId(userId) {
  const sql = 'SELECT * FROM ajanlatok WHERE tulajId = ?;';
  const [rows] = await connectionPool.execute(sql, [userId]);
  return rows[0];
}

async function updateOffer(offerId, decision) {
  const sql = 'UPDATE ajanlatok SET statusz = ? WHERE id = ?;';
  await connectionPool.execute(sql, [decision, offerId]);
}

async function searchUsers(filters) {
  let query = 'SELECT * FROM felhasznalok WHERE 1=1';
  const params = [];

  if (filters.name) {
    query += ' AND nev LIKE ?';
    params.push(`%${filters.name}%`);
  }
  if (filters.role) {
    query += ' AND szerep LIKE ?';
    params.push(`%${filters.role}%`);
  }
  const [users] = await connectionPool.execute(query, params);
  return users;
}

async function searchListings(filters) {
  let query = 'SELECT * FROM Autok WHERE 1 = 1';
  const params = [];

  if (filters.marka) {
    query += ' AND marka LIKE ?';
    params.push(`%${filters.marka}%`);
  }
  if (filters.model) {
    query += ' AND model LIKE ?';
    params.push(`%${filters.model}%`);
  }
  if (filters.varos) {
    query += ' AND varos LIKE ?';
    params.push(`%${filters.varos}%`);
  }
  if (filters.motor) {
    query += ' AND motor LIKE ?';
    params.push(`%${filters.motor}%`);
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
  getListingOwner,
  updateListing,
  deleteListing,
  createUser,
  getAllUsers,
  getUserById,
  findUserByUsername,
  getUserPassword,
  deleteUser,
  addImageToListing,
  deleteImageById,
  getImagesByCarId,
  getImageOwner,
  getImageById,
  searchUsers,
  searchListings,
  createOffer,
  getOffersByCarId,
  getOfferByOfferorId,
  getOfferByListerId,
  updateOffer,
};
