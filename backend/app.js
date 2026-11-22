const express = require('express');
const bodyParser = require('body-parser');

// Import routes
const bookmarkRoutes = require('./routes/bookmarks');

function createServer() {
  const app = express();
  initializeMiddleware(app);
  configureRoutes(app);
  return app;
}

function initializeMiddleware(app) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
}

function configureRoutes(app) {
  app.use('/api/bookmarks', bookmarkRoutes);
}

function startServer(app, port) {
  app.listen(port, () => {
    console.log(`Bookmark Manager API listening on port ${port}`);
  });
}

module.exports = {
  createServer,
  initializeMiddleware,
  configureRoutes,
  startServer,
};
