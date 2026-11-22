const mongoose = require('mongoose');

// Define bookmark schema
const bookmarkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  folder: { type: String, default: '' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update updatedAt on save
bookmarkSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

// Create a new bookmark
async function createBookmark(data) {
  const bookmark = new Bookmark(data);
  return await bookmark.save();
}

// Get a bookmark by ID
async function getBookmarkById(id) {
  return await Bookmark.findById(id).exec();
}

// Update a bookmark by ID
async function updateBookmark(id, data) {
  data.updatedAt = Date.now();
  return await Bookmark.findByIdAndUpdate(id, data, { new: true }).exec();
}

// Delete a bookmark by ID
async function deleteBookmark(id) {
  // Return the deleted bookmark document for confirmation
  return await Bookmark.findByIdAndDelete(id).exec();
}

// Search bookmarks by title, description, tags, or folder
async function searchBookmarks(query) {
  const regex = new RegExp(query, 'i');
  return await Bookmark.find({
    $or: [
      { title: regex },
      { description: regex },
      { tags: regex },
      { folder: regex }
    ]
  }).exec();
}

module.exports = {
  Bookmark,
  createBookmark,
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
  searchBookmarks,
};
