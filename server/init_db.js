import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function init() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    const dbName = process.env.DB_NAME || 'notess_db';
    console.log(`Creating database ${dbName} if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);

    console.log(`Using database ${dbName}...`);
    await connection.query(`USE ${dbName}`);

    console.log('Reading schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split queries by semicolon and execute them one by one
    // Simple splitting, assuming no semicolons in string literals for now
    // A better approach would be to read the file and let mysql execute multiple statements if configured
    // But default query() might not support multiple statements unless configured.
    // Let's configure connection to allow multiple statements? 
    // Or just run the file as one big string if possible?
    // mysql2 supports multipleStatements option.

    // Re-connect with database selected and multipleStatements enabled
    await connection.end();

    const dbConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      multipleStatements: true
    });

    console.log('Executing schema...');
    await dbConnection.query(schemaSql);

    console.log('Database initialized successfully!');
    await dbConnection.end();

  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    // await connection.end(); // Already closed above
  }
}

init();
