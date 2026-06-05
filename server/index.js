import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const vendors = [
  { id: '1', name: 'Demo Vendor', email: 'info@demo.com' }
];

app.get('/api/vendors', (req, res) => {
  res.json(vendors);
});

app.post('/api/vendors', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const vendor = { id: String(vendors.length + 1), name, email };
  vendors.push(vendor);
  res.status(201).json(vendor);
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
