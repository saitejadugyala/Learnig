const mongoose = require('mongoose');

// Define the Folder schema
const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update updatedAt on save
folderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create the Folder model
const Folder = mongoose.model('Folder', folderSchema);

// Create a new folder
async function createFolder(data) {
  const folder = new Folder(data);
  return folder.save();
}

// Get a folder by its ID
async function getFolderById(id) {
  return Folder.findById(id).exec();
}

// Update a folder by its ID
async function updateFolder(id, updateData) {
  updateData.updatedAt = Date.now();
  return Folder.findByIdAndUpdate(id, updateData, { new: true }).exec();
}

// Delete a folder by its ID
async function deleteFolder(id) {
  return Folder.findByIdAndDelete(id).exec();
}

module.exports = {
  Folder,
  createFolder,
  getFolderById,
  updateFolder,
  deleteFolder,
};
