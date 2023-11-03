const express = require("express");
const path = require("path");
const axios = require("axios");
const { auth, requiresAuth } = require('express-openid-connect');


const port = 3000;

const authUrl = "https://dev-boktwe0ddzg4fbxp.us.auth0.com";
const authTokenUrl = "https://dev-boktwe0ddzg4fbxp.us.auth0.com/oauth/token";

require("dotenv").config();

const config = {
  authRequired: true,
  auth0Logout: true,
  baseURL: 'http://localhost:3000',
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: authUrl,
  secret: process.env.CLIENT_SECRET,
  logoutParams: {
    returnTo: 'http://localhost:3000/logout', // Specify your custom return URL after logout
  },
};


const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(auth(config));

const indexPath = path.join(__dirname + "/index.html");


app.get("/", (req, res) => {
  if (req.oidc.isAuthenticated()) {
    res.render('profile', { User: req.oidc.user.email });
  } else {
    res.sendFile(path.join(indexPath));
  }
});

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;

  const requestBody = {
    audience: `${authUrl}/api/v2/`,
    grant_type: "password",
    client_id: clientId,
    client_secret: clientSecret,
    username: login,
    password: password,
  };
  
  axios
    .post(authTokenUrl, requestBody)
    .then((response) => {
      const token = response.data.access_token;
      res.json({ token });
    })
    .catch((error) => {
      console.log(error);
      res.status(401).json("Fail login" + error?.message);
    });
    
});

app.post('/api/register', (req, res) => {
  axios
  .post(`${authUrl}/oauth/token`, {
    client_id: clientId,
    client_secret: clientSecret,
    audience: `${authUrl}/api/v2/`,
    grant_type: "client_credentials",
  })
  .then((response) => {
    const accessToken = response.data.access_token;

    const requestBody = {
      email: req.body.login,
      password: req.body.password,
      connection: "Username-Password-Authentication",
    };

    axios
    .post(`${authUrl}/api/v2/users`, requestBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      res.json(requestBody.email + " registered success");
    })
    .catch((error) => {
      console.log(error);
      res.status(401).json("Fail registred: " + error?.message);
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
