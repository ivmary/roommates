const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

dotenv.config();

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/apartments', require('./routes/apartments'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/cities', require('./routes/cities'));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error('MongoDB connection error:', err));
