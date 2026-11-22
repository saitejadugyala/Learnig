const mongoose = require('mongoose');

// Define tag schema
const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  color: { type: String, required: false, trim: true }, // Optional field to store color
}, { timestamps: true });

// Create Tag model
const Tag = mongoose.model('Tag', tagSchema);

// Create a new tag
async function createTag(tagData) {
  const tag = new Tag(tagData);
  return await tag.save();
}

// Get tag by ID
async function getTagById(id) {
  return await Tag.findById(id).exec();
}

// Update tag by ID
async function updateTag(id, updateData) {
  return await Tag.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
}

// Delete tag by ID
async function deleteTag(id) {
  return await Tag.findByIdAndDelete(id).exec();
}

module.exports = {
  Tag,
  createTag,
  getTagById,
  updateTag,
  deleteTag,
};
