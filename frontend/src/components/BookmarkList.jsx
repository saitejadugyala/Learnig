import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

function BookmarkList({ bookmarks, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('title');
  const [sortOrderAsc, setSortOrderAsc] = useState(true);

  // Filters bookmarks based on search term matching title, URL, tags, or folder
  function filterBookmarks(items, term) {
    if (!term) return items;
    const lowerTerm = term.toLowerCase();
    return items.filter((b) => {
      const titleMatch = b.title.toLowerCase().includes(lowerTerm);
      const urlMatch = b.url.toLowerCase().includes(lowerTerm);
      const folderMatch = b.folder ? b.folder.toLowerCase().includes(lowerTerm) : false;
      const tagsMatch = b.tags ? b.tags.some(tag => tag.toLowerCase().includes(lowerTerm)) : false;
      return titleMatch || urlMatch || folderMatch || tagsMatch;
    });
  }

  // Sorts bookmarks by given key (title, url, folder) and order
  function sortBookmarks(items, key, asc) {
    const sorted = [...items].sort((a, b) => {
      // Handle possible undefined folder
      const valA = (a[key] || '').toString().toLowerCase();
      const valB = (b[key] || '').toString().toLowerCase();
      if (valA < valB) return asc ? -1 : 1;
      if (valA > valB) return asc ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  // Renders a single bookmark item with edit and delete buttons
  function renderBookmarkItem(bookmark) {
    return (
      <li key={bookmark.id} className="bookmark-item">
        <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="bookmark-link">
          {bookmark.title}
        </a>
        <div className="bookmark-meta">
          {bookmark.folder && <span className="bookmark-folder">Folder: {bookmark.folder}</span>}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <span className="bookmark-tags">Tags: {bookmark.tags.join(', ')}</span>
          )}
        </div>
        <div className="bookmark-actions">
          <button onClick={() => onEdit(bookmark)} aria-label={`Edit bookmark ${bookmark.title}`}>Edit</button>
          <button onClick={() => onDelete(bookmark.id)} aria-label={`Delete bookmark ${bookmark.title}`}>Delete</button>
        </div>
      </li>
    );
  }

  // Memoize filtered and sorted bookmarks for performance
  const displayedBookmarks = useMemo(() => {
    const filtered = filterBookmarks(bookmarks, searchTerm);
    return sortBookmarks(filtered, sortKey, sortOrderAsc);
  }, [bookmarks, searchTerm, sortKey, sortOrderAsc]);

  return (
    <div className="bookmark-list-container">
      <div className="bookmark-list-controls">
        <input
          type="text"
          placeholder="Search bookmarks by title, URL, tags, or folder..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search bookmarks"
          className="bookmark-search-input"
        />
        <label htmlFor="sortKeySelect" className="bookmark-sort-label">
          Sort by:
        </label>
        <select
          id="sortKeySelect"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="bookmark-sort-select"
        >
          <option value="title">Title</option>
          <option value="url">URL</option>
          <option value="folder">Folder</option>
        </select>
        <button
          onClick={() => setSortOrderAsc(!sortOrderAsc)}
          aria-label={sortOrderAsc ? 'Sort descending' : 'Sort ascending'}
          className="bookmark-sort-order-btn"
          type="button"
        >
          {sortOrderAsc ? '▲' : '▼'}
        </button>
      </div>
      <ul className="bookmark-list" role="list">
        {displayedBookmarks.length === 0 ? (
          <li className="bookmark-empty-message">No bookmarks to display.</li>
        ) : (
          displayedBookmarks.map(renderBookmarkItem)
        )}
      </ul>
    </div>
  );
}

BookmarkList.propTypes = {
  bookmarks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string),
      folder: PropTypes.string,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default BookmarkList;
