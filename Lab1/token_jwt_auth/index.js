const uuid = require('uuid');
const express = require('express');
const onFinished = require('on-finished');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const JWT_SECRET = 'jwt';
const JWT_EXPIRES = '15s';

const SESSION_KEY = 'Authorization';

app.use((req, res, next) => {
  let currentUser = {};
  let token = req.get(SESSION_KEY);

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      currentUser = { username: decoded.username, login: decoded.login };
    } catch (err) {
      // err
    }
  }

  req.user = currentUser;

  next();
});

app.get('/', (req, res) => {
  if (req.user.username) {
    return res.json({
      username: req.user.username,
      logout: 'http://localhost:3000/logout',
    });
  }
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/logout', (req, res) => {
  sessions.destroy(req, res);
  res.redirect('/');
});

const users = [
  {
    login: 'Login',
    password: 'Password',
    username: 'Username',
  },
  {
    login: 'Login1',
    password: 'Password1',
    username: 'Username1',
  },
];

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  const user = users.find(user => {
    if (user.login == login && user.password == password) {
      return true;
    }
    return false;
  });

  if (user) {
    const token = jwt.sign(
      {
        username: user.username,
        login: user.login,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({ token });
  }

  res.status(401).send();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
