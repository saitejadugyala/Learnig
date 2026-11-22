// notepadStorage.js
// Manages the Session Note Storage Module for storing and retrieving note content temporarily
// in browser session memory during the user's session.

const notepadStorage = (function() {
  // Internal in-memory storage object for notes keyed by sessionId
  const notes = {};

  /**
   * Saves the note content for a given sessionId
   * @param {string} sessionId - Unique identifier for the user session
   * @param {string} noteContent - The text content of the note to be saved
   */
  function saveNote(sessionId, noteContent) {
    if (typeof sessionId !== 'string' || typeof noteContent !== 'string') {
      throw new TypeError('Invalid input types for saveNote');
    }
    notes[sessionId] = noteContent;
  }

  /**
   * Retrieves the saved note content for a given sessionId
   * @param {string} sessionId - Unique identifier for the user session
   * @returns {string} The saved note content or empty string if none saved
   */
  function getNote(sessionId) {
    if (typeof sessionId !== 'string') {
      throw new TypeError('Invalid sessionId type for getNote');
    }
    return notes[sessionId] || '';
  }

  /**
   * Clears/deletes the saved note content for a given sessionId
   * @param {string} sessionId - Unique identifier for the user session
   */
  function clearNote(sessionId) {
    if (typeof sessionId !== 'string') {
      throw new TypeError('Invalid sessionId type for clearNote');
    }
    delete notes[sessionId];
  }

  return {
    saveNote,
    getNote,
    clearNote
  };

})();

export default notepadStorage;
