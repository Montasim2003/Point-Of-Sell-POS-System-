import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. Initial Pool connection without database to create it if not exists
const initDB = async () => {
  try {
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS smart_pos`);
    await tempConnection.end();
    console.log('Database "smart_pos" verified/created successfully.');
  } catch (error) {
    console.error('Error creating database:', error);
  }
};

await initDB();

// 2. Main Connection Pool with database
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_pos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 3. Auto-create tables on startup
const createTables = async () => {
  try {
    const connection = await pool.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255),
          sku VARCHAR(100),
          costPrice DECIMAL(10,2),
          sellingPrice DECIMAL(10,2),
          stock INT,
          categoryId VARCHAR(50),
          isActive BOOLEAN,
          full_data JSON
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255),
          phone VARCHAR(100),
          totalSpent DECIMAL(10,2),
          dueBalance DECIMAL(10,2),
          loyaltyPoints INT,
          full_data JSON
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sales (
          id VARCHAR(50) PRIMARY KEY,
          invoiceNumber VARCHAR(100),
          date DATETIME,
          customerName VARCHAR(255),
          subTotal DECIMAL(10,2),
          totalAmount DECIMAL(10,2),
          amountPaid DECIMAL(10,2),
          amountDue DECIMAL(10,2),
          status VARCHAR(50),
          full_data JSON
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
          id VARCHAR(50) PRIMARY KEY,
          category VARCHAR(100),
          title VARCHAR(255),
          amount DECIMAL(10,2),
          date DATE,
          recordedBy VARCHAR(100),
          full_data JSON
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS heldCarts (
          id VARCHAR(50) PRIMARY KEY,
          title VARCHAR(255),
          full_data JSON
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
          id VARCHAR(50) PRIMARY KEY,
          full_data JSON
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS staff (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255),
          role VARCHAR(100),
          full_data JSON
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255),
          full_data JSON
      )
    `);

    connection.release();
    console.log('All database tables verified/created successfully!');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
};

await createTables();

// 4. GET Route
app.get('/api/store/:collection', async (req, res) => {
  const { collection } = req.params;
  
  const validCollections = ['products', 'customers', 'sales', 'expenses', 'heldCarts', 'settings', 'staff', 'categories'];
  if (!validCollections.includes(collection)) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  try {
    const [rows] = await pool.query(`SELECT full_data FROM ${collection}`);
    
    const parsedData = rows.map(row => {
      return typeof row.full_data === 'string' ? JSON.parse(row.full_data) : row.full_data;
    });

    if (collection === 'settings' && parsedData.length > 0) {
      return res.json(parsedData[0]); 
    }
    
    res.json(parsedData);
  } catch (error) {
    console.error(`Error reading ${collection}:`, error);
    res.status(500).json({ error: 'Internal Server Error while reading from MySQL' });
  }
});

// 5. POST Route
app.post('/api/store/:collection', async (req, res) => {
  const { collection } = req.params;
  const validCollections = ['products', 'customers', 'sales', 'expenses', 'heldCarts', 'settings', 'staff', 'categories'];
  
  if (!validCollections.includes(collection)) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  const connection = await pool.getConnection();
  try {
    const dataToSave = req.body;
    let dataArray = Array.isArray(dataToSave) ? dataToSave : [dataToSave];
    
    await connection.beginTransaction();

    if (dataArray.length > 0 && Object.keys(dataArray[0]).length > 0) {
      for (const item of dataArray) {
        const fullDataStr = JSON.stringify(item);
        const id = item.id || 'singleton';

        if (collection === 'products') {
          await connection.query(
            `INSERT INTO products (id, name, sku, costPrice, sellingPrice, stock, categoryId, isActive, full_data) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             name=VALUES(name), sku=VALUES(sku), costPrice=VALUES(costPrice), sellingPrice=VALUES(sellingPrice), stock=VALUES(stock), categoryId=VALUES(categoryId), isActive=VALUES(isActive), full_data=VALUES(full_data)`,
            [id, item.name || '', item.sku || '', item.costPrice || 0, item.sellingPrice || 0, item.stock || 0, item.categoryId || '', item.isActive ? 1 : 0, fullDataStr]
          );
        } else if (collection === 'customers') {
          await connection.query(
            `INSERT INTO customers (id, name, phone, totalSpent, dueBalance, loyaltyPoints, full_data) 
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             name=VALUES(name), phone=VALUES(phone), totalSpent=VALUES(totalSpent), dueBalance=VALUES(dueBalance), loyaltyPoints=VALUES(loyaltyPoints), full_data=VALUES(full_data)`,
            [id, item.name || '', item.phone || '', item.totalSpent || 0, item.dueBalance || 0, item.loyaltyPoints || 0, fullDataStr]
          );
        } else if (collection === 'sales') {
          let validDate = null;
          if (item.date) {
             const d = new Date(item.date);
             if (!isNaN(d.getTime())) {
                validDate = d.toISOString().slice(0, 19).replace('T', ' ');
             }
          }
          await connection.query(
            `INSERT INTO sales (id, invoiceNumber, date, customerName, subTotal, totalAmount, amountPaid, amountDue, status, full_data) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             invoiceNumber=VALUES(invoiceNumber), date=VALUES(date), customerName=VALUES(customerName), subTotal=VALUES(subTotal), totalAmount=VALUES(totalAmount), amountPaid=VALUES(amountPaid), amountDue=VALUES(amountDue), status=VALUES(status), full_data=VALUES(full_data)`,
            [id, item.invoiceNumber || '', validDate, item.customerName || '', item.subTotal || 0, item.totalAmount || 0, item.amountPaid || 0, item.amountDue || 0, item.status || '', fullDataStr]
          );
        } else if (collection === 'expenses') {
          let validDate = null;
          if (item.date) {
             const d = new Date(item.date);
             if (!isNaN(d.getTime())) {
                validDate = d.toISOString().slice(0, 10);
             }
          }
          await connection.query(
            `INSERT INTO expenses (id, category, title, amount, date, recordedBy, full_data) 
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             category=VALUES(category), title=VALUES(title), amount=VALUES(amount), date=VALUES(date), recordedBy=VALUES(recordedBy), full_data=VALUES(full_data)`,
            [id, item.category || '', item.title || '', item.amount || 0, validDate, item.recordedBy || '', fullDataStr]
          );
        } else if (collection === 'staff') {
           await connection.query(
            `INSERT INTO staff (id, name, role, full_data) 
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             name=VALUES(name), role=VALUES(role), full_data=VALUES(full_data)`,
            [id, item.name || '', item.role || '', fullDataStr]
          );
        } else if (collection === 'categories') {
           await connection.query(
            `INSERT INTO categories (id, name, full_data) 
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE
             name=VALUES(name), full_data=VALUES(full_data)`,
            [id, item.name || '', fullDataStr]
          );
        } else if (collection === 'heldCarts') {
           await connection.query(
            `INSERT INTO heldCarts (id, title, full_data) 
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE
             title=VALUES(title), full_data=VALUES(full_data)`,
            [id, item.title || '', fullDataStr]
          );
        } else if (collection === 'settings') {
           await connection.query(
            `INSERT INTO settings (id, full_data) 
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE
             full_data=VALUES(full_data)`,
            [id, fullDataStr]
          );
        }
      }
    }
    
    await connection.commit();
    res.json({ success: true, message: `${collection} saved successfully to MySQL.` });
  } catch (error) {
    await connection.rollback();
    console.error(`Error saving ${collection}:`, error);
    res.status(500).json({ error: 'Internal Server Error while saving to MySQL' });
  } finally {
    connection.release();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});