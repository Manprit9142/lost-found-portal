const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// File paths
const usersFile = path.join(__dirname, 'data', 'users.json');
const itemsFile = path.join(__dirname, 'data', 'items.json');

// Helper to read JSON data from file
function readData(filePath) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]', 'utf8');
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Helper to write JSON data to file
function writeData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { username, email, password } = req.body;
  const users = readData(usersFile);
  if (users.find(u => u.username === username || u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  users.push({ username, email, password });
  writeData(usersFile, users);
  res.json({ message: 'Signup successful' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readData(usersFile);
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ message: 'Login successful' });
});

// Report lost item
app.post('/api/items/lost', (req, res) => {
  const { name, description } = req.body;
  const items = readData(itemsFile);
  const newItem = { id: Date.now(), name, description, type: 'lost' };
  items.push(newItem);
  writeData(itemsFile, items);
  res.json({ message: 'Lost item reported' });
});

// Report found item
app.post('/api/items/found', (req, res) => {
  const { name, description } = req.body;
  const items = readData(itemsFile);
  const newItem = { id: Date.now(), name, description, type: 'found' };
  items.push(newItem);
  writeData(itemsFile, items);
  res.json({ message: 'Found item reported' });
});

// Get all items
app.get('/api/items', (req, res) => {
  const items = readData(itemsFile);
  res.json({ items });
});

// Get item by ID (make sure the param is named simply `id`)
app.get('/api/items/:id', (req, res) => {
  const items = readData(itemsFile);
  const item = items.find(i => i.id.toString() === req.params.id);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.json({ item });
});

// Claim item
app.post('/api/items/claim', (req, res) => {
  const { id } = req.body;
  const items = readData(itemsFile);
  const index = items.findIndex(i => i.id.toString() === id);
  if (index === -1) return res.status(404).json({ message: 'Item not found' });
  items.splice(index, 1);
  writeData(itemsFile, items);
  res.json({ message: 'Item claimed' });
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Fallback route for SPA (single page app) frontend routing — put this last!

const indexPath = path.join(__dirname, '..', 'frontend', 'index.html');
app.get('/*', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Frontend index.html not found');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

