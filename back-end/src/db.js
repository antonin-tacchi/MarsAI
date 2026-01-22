import mysql from "mysql2/promise";

// Create a shared MySQL connection poo
// Connection parameters are read from .env variables  
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,      
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export default db;
