const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');
const projectRoute = require('./routes/projects-routes');
const courseRoute = require('./routes/courses-routes');
const usersRoutes = require('./routes/users-routes');
const path = require('path');
const app = express();
require('dotenv').config();

app.use(bodyParser.json());

app.use(
  '/api/tweekdev/uploads/images',
  express.static(path.join('uploads', 'images'))
);
app.use(express.static(path.join('public')));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/tweekdev/projects', projectRoute); // => /api/places/...
//app.use('/api/tweekdev/courses', courseRoute); // => /api/places/...
app.use('/api/tweekdev/users', usersRoutes); // => /api/users/...

app.use((req, res, next) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});
/*app.use((req, res, next) => {
  const error = new HttpError('Could not find this route', 404);
  throw error;
});
*/
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, () => {
      console.log(error);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred.' });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@tweekdev.wzxks.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true }
  )
  .then(() => {
    app.listen(2000);
  })
  .catch((error) => {
    console.log(error);
  });
