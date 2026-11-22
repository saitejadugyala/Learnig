import React, { useState, useEffect } from 'react';

// Helper function to initialize state from backend API
// For simplicity, still using localStorage fallback
async function fetchBookmarks() {
  try {
    const response = await fetch('/api/bookmarks');
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch {}
  // fallback to localStorage (deprecated fallback)
  const saved = localStorage.getItem('bookmarks');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }
  return [];
}

function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load bookmarks from backend on mount
  useEffect(() => {
    fetchBookmarks().then(setBookmarks);
  }, []);

  // Save bookmarks to localStorage on change (still for fallback)
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // CRUD operation helpers integrating with an API

  // Add a new bookmark
  async function handleAddBookmark(newBookmark) {
    // POST to backend
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookmark),
      });
      if (res.ok) {
        const created = await res.json();
        setBookmarks((prev) => [...prev, created]);
      } else {
        alert('Failed to add bookmark');
      }
    } catch {
      alert('Error connecting to server.');
    }
  }

  // Edit existing bookmark by id
  async function handleEditBookmark(id, updatedBookmark) {
    try {
      const res = await fetch(`/api/bookmarks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBookmark),
      });
      if (res.ok) {
        const updated = await res.json();
        setBookmarks((prev) =>
          prev.map((bm) => (bm.id === id ? updated : bm))
        );
      } else {
        alert('Failed to update bookmark');
      }
    } catch {
      alert('Error connecting to server.');
    }
  }

  // Delete bookmark by id
  async function handleDeleteBookmark(id) {
    try {
      const res = await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // The backend now returns the deleted bookmark object directly
        const deletedBookmark = await res.json();
        if (deletedBookmark && deletedBookmark.id) {
          setBookmarks((prev) => prev.filter((bm) => bm.id !== deletedBookmark.id));
        } else {
          // fallback if no id returned, remove by id
          setBookmarks((prev) => prev.filter((bm) => bm.id !== id));
        }
      } else {
        alert('Failed to delete bookmark');
      }
    } catch {
      alert('Error connecting to server.');
    }
  }

  // Organize bookmarks by updating order and folders - sync to backend
  // This example sorts by title alphabetically globally and updates order field
  async function handleOrganizeBookmarks() {
    const sorted = [...bookmarks].sort((a, b) => a.title.localeCompare(b.title));
    // assign new order sequentially
    const updated = sorted.map((bm, index) => ({ ...bm, order: index }));
    // Save each updated bookmark
    try {
      for (const bm of updated) {
        await fetch(`/api/bookmarks/${bm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: bm.order }),
        });
      }
      setBookmarks(updated);
    } catch {
      alert('Failed to organize bookmarks on server.');
    }
  }

  // Search bookmarks by title, url, tags, folder via backend query
  async function handleSearchBookmarks(term) {
    setSearchTerm(term);
    try {
      const url = term
        ? `/api/bookmarks/search?q=${encodeURIComponent(term)}`
        : '/api/bookmarks';
      const res = await fetch(url);
      if (res.ok) {
        const results = await res.json();
        setBookmarks(results);
      } else {
        alert('Search failed.');
      }
    } catch {
      alert('Error connecting to server.');
    }
  }

  // We do not filter client-side, since backend returns filtered
  const displayedBookmarks = bookmarks;

  return (
    <div className="app-container">
      <header>
        <h1>Bookmark Manager</h1>
      </header>

      <section className="controls">
        <input
          type="text"
          placeholder="Search bookmarks"
          value={searchTerm}
          onChange={(e) => handleSearchBookmarks(e.target.value)}
          aria-label="Search bookmarks"
        />
        <button onClick={handleOrganizeBookmarks} aria-label="Organize bookmarks">
          Organize
        </button>
      </section>

      <section className="bookmark-list">
        {displayedBookmarks.length === 0 ? (
          <p>No bookmarks found.</p>
        ) : (
          <ul>
            {displayedBookmarks.map(({ id, title, url, tags = [], folder, order, description }) => (
              <li key={id} className="bookmark-item">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {title}
                </a>
                {folder && <span className="bookmark-folder">[{folder}]</span>}
                {tags.length > 0 && (
                  <span className="bookmark-tags">Tags: {tags.join(', ')}</span>
                )}
                {description && <p className="bookmark-description">{description}</p>}

                <button
                  onClick={() => {
                    // Prompt for all editable fields including tags (comma-separated), folder, description
                    const newTitle = prompt('Edit title:', title);
                    if (newTitle === null) return;
                    const newUrl = prompt('Edit URL:', url);
                    if (newUrl === null) return;
                    const newDescription = prompt('Edit description:', description || '');
                    if (newDescription === null) return;
                    const newFolder = prompt('Edit folder:', folder || '');
                    if (newFolder === null) return;
                    const newTagsStr = prompt('Edit tags (comma separated):', tags.join(','));
                    if (newTagsStr === null) return;
                    const newTags = newTagsStr
                      .split(',')
                      .map((t) => t.trim())
                      .filter((t) => t.length > 0);

                    // Validate URL
                    try {
                      new URL(newUrl);
                    } catch {
                      alert('Please enter a valid URL.');
                      return;
                    }
                    handleEditBookmark(id, {
                      title: newTitle.trim(),
                      url: newUrl.trim(),
                      description: newDescription.trim(),
                      folder: newFolder.trim(),
                      tags: newTags,
                    });
                  }}
                  aria-label={`Edit bookmark ${title}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete bookmark ${title}?`)) {
                      handleDeleteBookmark(id);
                    }
                  }}
                  aria-label={`Delete bookmark ${title}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="add-bookmark">
        <h2>Add Bookmark</h2>
        <AddBookmarkForm onAdd={handleAddBookmark} />
      </section>
    </div>
  );
}

function AddBookmarkForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [folder, setFolder] = useState('');
  const [tags, setTags] = useState(''); // comma separated string

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert('Both Title and URL are required.');
      return;
    }
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      alert('Please enter a valid URL.');
      return;
    }
    const tagsArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // id left out here, backend assigns id
    onAdd({ title: title.trim(), url: url.trim(), description: description.trim(), folder: folder.trim(), tags: tagsArray });
    setTitle('');
    setUrl('');
    setDescription('');
    setFolder('');
    setTags('');
  }

  return (
    <form onSubmit={handleSubmit} className="add-bookmark-form">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Bookmark title"
      />
      <input
        type="url"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        aria-label="Bookmark URL"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        aria-label="Bookmark description"
      />
      <input
        type="text"
        placeholder="Folder"
        value={folder}
        onChange={(e) => setFolder(e.target.value)}
        aria-label="Bookmark folder"
      />
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        aria-label="Bookmark tags"
      />
      <button type="submit">Add</button>
    </form>
  );
}

export default App;
