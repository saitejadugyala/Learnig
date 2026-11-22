import React, { useState, useEffect } from 'react';

const validateUrl = (url) => {
  try {
    const validUrl = new URL(url);
    return validUrl.protocol === 'http:' || validUrl.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

const BookmarkForm = ({ initialData = {}, folders = [], onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    folder: '',
    tags: '', // tags as comma separated string
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        url: initialData.url || '',
        title: initialData.title || '',
        folder: initialData.folder || '',
        tags: (initialData.tags || []).join(', '),
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required.';
    } else if (!validateUrl(formData.url.trim())) {
      newErrors.url = 'Please enter a valid HTTP/HTTPS URL.';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required.';
    }

    if (formData.folder && !folders.includes(formData.folder)) {
      newErrors.folder = 'Selected folder does not exist.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const bookmarkData = {
        url: formData.url.trim(),
        title: formData.title.trim(),
        folder: formData.folder || null,
        tags: formData.tags
          ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
          : [],
      };

      onSubmit(bookmarkData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bookmark-form">
      <div className="form-group">
        <label htmlFor="url">URL *</label>
        <input
          type="text"
          id="url"
          name="url"
          value={formData.url}
          onChange={handleInputChange}
          placeholder="https://example.com"
        />
        {errors.url && <span className="error">{errors.url}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Bookmark title"
        />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="folder">Folder</label>
        <select
          id="folder"
          name="folder"
          value={formData.folder}
          onChange={handleInputChange}
        >
          <option value="">-- None --</option>
          {folders.map((folderName) => (
            <option key={folderName} value={folderName}>
              {folderName}
            </option>
          ))}
        </select>
        {errors.folder && <span className="error">{errors.folder}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma separated)</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          placeholder="tag1, tag2, ..."
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Save</button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default BookmarkForm;
