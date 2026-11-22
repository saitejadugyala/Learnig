import React, { useState } from 'react';
import PropTypes from 'prop-types';

// FolderTree component: renders a tree of folders allowing selection for bookmark organization
export default function FolderTree({ folders, onSelectFolder }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  // Toggle expand/collapse of a folder node
  function toggleFolderExpansion(folderId) {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }

  // Handle folder selection and notify parent
  function handleFolderSelection(folder) {
    setSelectedFolderId(folder.id);
    if (onSelectFolder) {
      onSelectFolder(folder);
    }
  }

  // Recursive rendering function for a folder and its children
  function renderFolderNode(folder, level = 0) {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id} style={{ paddingLeft: 20 * level, userSelect: 'none' }}>
        <div
          onClick={() => {
            if (hasChildren) {
              toggleFolderExpansion(folder.id);
            }
            handleFolderSelection(folder);
          }}
          style={{
            cursor: 'pointer',
            fontWeight: isSelected ? 'bold' : 'normal',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
          title={folder.name}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (hasChildren) {
                toggleFolderExpansion(folder.id);
              }
              handleFolderSelection(folder);
            }
          }}
        >
          {hasChildren ? (
            <span style={{ width: 12, display: 'inline-block', textAlign: 'center' }}>
              {isExpanded ? '\u25BC' /* down */ : '\u25B6' /* right */}
            </span>
          ) : (
            <span style={{ width: 12, display: 'inline-block' }} />
          )}
          <span>{folder.name}</span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {folder.children.map(child => renderFolderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }

  return <div>{folders.map(folder => renderFolderNode(folder))}</div>;
}

FolderTree.propTypes = {
  folders: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      children: PropTypes.array
    })
  ).isRequired,
  onSelectFolder: PropTypes.func
};
