import mysql from "mysql2/promise";

const globalForDb = global;

export const pool =
  globalForDb.mysqlPool ||
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "smart_lost_found",
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.mysqlPool = pool;
}
