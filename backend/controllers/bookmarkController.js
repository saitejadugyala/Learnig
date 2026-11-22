const Bookmark = require('../models/bookmark');

/**
 * Adds a new bookmark.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function addBookmark(req, res) {
  try {
    const { url, title, description, tags, folder } = req.body;
    if (!url || !title) {
      return res.status(400).json({ message: 'URL and title are required.' });
    }

    const newBookmark = new Bookmark({ url, title, description: description || '', tags: tags || [], folder: folder || null, order: 0 });

    // Determine the maximum order value to place the new bookmark last
    const maxOrderBookmark = await Bookmark.findOne().sort({ order: -1 }).exec();
    if (maxOrderBookmark) {
      newBookmark.order = maxOrderBookmark.order + 1;
    }

    await newBookmark.save();

    return res.status(201).json(newBookmark);
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return res.status(500).json({ message: 'Failed to add bookmark.' });
  }
}

/**
 * Edits an existing bookmark.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function editBookmark(req, res) {
  try {
    const { id } = req.params;
    const { url, title, description, tags, folder } = req.body;

    const bookmark = await Bookmark.findById(id);
    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found.' });
    }

    if (url !== undefined) bookmark.url = url;
    if (title !== undefined) bookmark.title = title;
    if (description !== undefined) bookmark.description = description;
    if (tags !== undefined) bookmark.tags = tags;
    if (folder !== undefined) bookmark.folder = folder;

    await bookmark.save();

    return res.status(200).json(bookmark);
  } catch (error) {
    console.error('Error editing bookmark:', error);
    return res.status(500).json({ message: 'Failed to edit bookmark.' });
  }
}

/**
 * Removes a bookmark by ID.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function removeBookmark(req, res) {
  try {
    const { id } = req.params;
    const bookmark = await Bookmark.findByIdAndDelete(id);
    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found.' });
    }

    // Return the deleted bookmark object directly to match frontend expectation
    return res.status(200).json(bookmark);
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return res.status(500).json({ message: 'Failed to remove bookmark.' });
  }
}

/**
 * Organizes bookmarks - for simplicity, this expects a list of bookmark IDs in the desired order and optionally folder assignments.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function organizeBookmarks(req, res) {
  try {
    const { orderedBookmarks } = req.body; // array of { id, folder }
    if (!Array.isArray(orderedBookmarks)) {
      return res.status(400).json({ message: 'Invalid data format for organized bookmarks.' });
    }

    // Update bookmarks one by one
    const updatePromises = orderedBookmarks.map(({ id, folder }, index) => {
      return Bookmark.findByIdAndUpdate(
        id,
        { order: index, folder: folder || null },
        { new: true }
      );
    });

    const updated = await Promise.all(updatePromises);

    return res.status(200).json({ message: 'Bookmarks organized successfully.', bookmarks: updated });
  } catch (error) {
    console.error('Error organizing bookmarks:', error);
    return res.status(500).json({ message: 'Failed to organize bookmarks.' });
  }
}

/**
 * Searches bookmarks by query.
 * Supports searching title, url, description, tags, and folder name case-insensitively.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function searchBookmarks(req, res) {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Query parameter q is required.' });
    }

    // Basic search using regex on title, url, description, tags, and folder
    const regex = new RegExp(q, 'i');
    const bookmarks = await Bookmark.find({
      $or: [
        { title: regex },
        { url: regex },
        { description: regex },
        { tags: regex },
        { folder: regex }
      ]
    }).sort({ order: 1 });

    return res.status(200).json(bookmarks);
  } catch (error) {
    console.error('Error searching bookmarks:', error);
    return res.status(500).json({ message: 'Failed to search bookmarks.' });
  }
}

module.exports = {
  addBookmark,
  editBookmark,
  removeBookmark,
  organizeBookmarks,
  searchBookmarks
};
