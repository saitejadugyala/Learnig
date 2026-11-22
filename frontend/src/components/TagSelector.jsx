import React, { useState } from 'react';
import PropTypes from 'prop-types';

const TagSelector = ({ tags, selectedTags, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleTagAdd = () => {
    const newTag = inputValue.trim();
    if (newTag && !selectedTags.includes(newTag)) {
      onChange([...selectedTags, newTag]);
      setInputValue('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    const filteredTags = selectedTags.filter(tag => tag !== tagToRemove);
    onChange(filteredTags);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  return (
    <div className="tag-selector">
      <div className="selected-tags">
        {selectedTags.map(tag => (
          <span key={tag} className="tag">
            {tag}
            <button
              type="button"
              className="remove-tag"
              aria-label={`Remove tag ${tag}`}
              onClick={() => handleTagRemove(tag)}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="tag-input"
        placeholder="Add a tag"
        value={inputValue}
        list="tag-options"
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <datalist id="tag-options">
        {tags.filter(tag => !selectedTags.includes(tag)).map(tag => (
          <option key={tag} value={tag} />
        ))}
      </datalist>
      <button type="button" onClick={handleTagAdd} className="add-tag-button">Add</button>
    </div>
  );
};

TagSelector.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TagSelector;
