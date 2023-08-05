const express = require('express');
const mongoose = require('mongoose');
const dbConnect = require('./config/database');
const fs = require('fs');
const path = require('path');
dbConnect();
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, 'public')));
const userRoutes = require('./routes/userRoute');
app.use('', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
 app.get('/', (req, res) => {
  const filePath = path.join(__dirname,  '..', 'frontend', 'index.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading file:', err);
          res.status(500).send('Error reading file');
      } else {
          res.setHeader('Content-Type', 'text/html');
          res.send(data);
      }
  });
});

app.get('/otpValidation', (req, res) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'otpValidation.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).send('Error reading file');
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.send(data);
    }
  });
});
app.get('/resendOtp', (req, res) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'resendOtp.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).send('Error reading file');
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.send(data);
    }
  });
});
app.get('/loginPage', (req, res) => {
  const filePath = path.join(__dirname, '..','frontend', 'loginPage.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).send('Error reading file');
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.send(data);
    }
  });
});
app.get('/dashboard', (req, res) => {
  const filePath = path.join(__dirname, '..', 'frontend', 'dashboard.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).send('Error reading file');
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.send(data);
    }
  });
});