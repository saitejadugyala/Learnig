const express = require('express');
const router = express.Router();
const bookmarkController = require('../controllers/bookmarkController');

// GET /bookmarks - List all bookmarks
router.get('/', async (req, res) => {
  try {
    const bookmarks = await bookmarkController.getBookmarks();
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /bookmarks - Create a new bookmark
router.post('/', async (req, res) => {
  const { title, url, tags = [], folder = null, description = '' } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: 'Title and URL are required' });
  }

  try {
    const newBookmark = await bookmarkController.createBookmark({ title, url, tags, folder, description });
    res.status(201).json(newBookmark);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /bookmarks/:id - Update a bookmark
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, url, tags, folder, description, order } = req.body;

  if (!title && !url && !tags && folder === undefined && description === undefined && order === undefined) {
    return res.status(400).json({ error: 'At least one field (title, url, tags, folder, description, or order) is required to update' });
  }

  try {
    const updatedBookmark = await bookmarkController.updateBookmark(id, { title, url, tags, folder, description, order });
    if (!updatedBookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    res.json(updatedBookmark);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /bookmarks/:id - Delete a bookmark
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBookmark = await bookmarkController.deleteBookmark(id);
    if (!deletedBookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    res.json(deletedBookmark);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /bookmarks/search?q=... - Search bookmarks by title, url, tags, or folder
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Search query parameter q is required' });
  }

  try {
    const results = await bookmarkController.searchBookmarks(q);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
