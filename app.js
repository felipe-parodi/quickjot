/**
 * Represents a single note in the application
 */
class Note {
    constructor(id, title, content, lastModified = new Date()) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.lastModified = lastModified;
    }
}

/**
 * Manages the note-taking application's functionality
 * Handles note creation, deletion, persistence, and UI updates
 */
class NotesManager {
    constructor() {
        // Initialize DOM elements
        this.noteContent = document.getElementById('note-content');
        this.noteSelector = document.getElementById('note-selector');
        this.searchInput = document.getElementById('search-input');
        this.newNoteBtn = document.getElementById('new-note');
        this.deleteNoteBtn = document.getElementById('delete-note');
        this.lastModifiedSpan = document.getElementById('last-modified');
        
        // Initialize state
        this.currentNoteId = null;
        this.notes = this.loadNotes();
        
        // Set up event handlers
        this.initializeEventListeners();
        this.updateNotesList();
        this.initializeKeyboardShortcuts();
    }

    /**
     * Loads notes from localStorage
     * @returns {Array} Array of Note objects
     */
    loadNotes() {
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) {
            const parsed = JSON.parse(savedNotes);
            return parsed.map(note => ({
                ...note,
                lastModified: new Date(note.lastModified)
            }));
        }
        return [];
    }

    /**
     * Creates a new note and makes it the active note
     */
    createNewNote() {
        const noteId = Date.now().toString();
        const noteTitle = `Note ${this.notes.length + 1}`;
        const newNote = new Note(noteId, noteTitle, '');
        this.notes.push(newNote);
        this.saveNotes();
        this.updateNotesList();
        this.selectNote(noteId);
        this.noteContent.disabled = false;
        this.noteContent.focus();
    }

    /**
     * Updates the notes list in the UI
     * @param {Array} filteredNotes - Optional array of filtered notes to display
     */
    updateNotesList(filteredNotes = null) {
        this.noteSelector.innerHTML = '<option value="">Select a note...</option>';
        const notesToShow = filteredNotes || this.notes;
        notesToShow.forEach(note => {
            const option = document.createElement('option');
            option.value = note.id;
            option.textContent = note.title;
            if (note.id === this.currentNoteId) {
                option.selected = true;
            }
            this.noteSelector.appendChild(option);
        });
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    deleteCurrentNote() {
        if (!this.currentNoteId) return;
        
        this.notes = this.notes.filter(note => note.id !== this.currentNoteId);
        this.saveNotes();
        this.updateNotesList();
        this.currentNoteId = null;
        this.noteContent.value = '';
        this.updateLastModified();
    }

    selectNote(noteId) {
        this.currentNoteId = noteId;
        const note = this.notes.find(note => note.id === noteId);
        if (note) {
            this.noteContent.value = note.content;
            this.noteContent.disabled = false;
            this.updateLastModified(note.lastModified);
        } else {
            this.noteContent.value = '';
            this.noteContent.disabled = true;
            this.updateLastModified();
        }
    }

    updateLastModified(date = null) {
        if (date) {
            this.lastModifiedSpan.textContent = `Last modified: ${date.toLocaleString()}`;
        } else {
            this.lastModifiedSpan.textContent = '';
        }
    }

    initializeEventListeners() {
        this.newNoteBtn.addEventListener('click', () => this.createNewNote());
        this.deleteNoteBtn.addEventListener('click', () => this.deleteCurrentNote());
        
        this.noteSelector.addEventListener('change', (e) => {
            this.selectNote(e.target.value);
        });

        this.noteContent.addEventListener('input', () => {
            if (!this.currentNoteId) return;
            
            const note = this.notes.find(note => note.id === this.currentNoteId);
            if (note) {
                note.content = this.noteContent.value;
                this.updateNoteTitle(note);
                note.lastModified = new Date();
                this.saveNotes();
                this.updateLastModified(note.lastModified);
                this.updateWordCount();
            }
        });

        this.searchInput.addEventListener('input', (e) => {
            this.filterNotes(e.target.value);
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-input') && !e.target.closest('.search-results')) {
                this.hideSearchResults();
            }
        });
    }

    initializeKeyboardShortcuts() {
        // Use window instead of document to ensure we catch all keyboard events
        window.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + E: New Note
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
                e.preventDefault();
                this.createNewNote();
            }
            
            // Cmd/Ctrl + X: Delete Note
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'x') {
                e.preventDefault();
                this.deleteCurrentNote();
            }
            
            // Cmd/Ctrl + ArrowUp/ArrowDown: Switch between notes
            if ((e.metaKey || e.ctrlKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                e.preventDefault();
                this.switchNote(e.key === 'ArrowUp' ? -1 : 1);
                // Keep the cursor position in the textarea
                const cursorPosition = this.noteContent.selectionStart;
                requestAnimationFrame(() => {
                    this.noteContent.selectionStart = cursorPosition;
                    this.noteContent.selectionEnd = cursorPosition;
                });
            }
        });
    }

    /**
     * Switch to the next or previous note
     * @param {number} direction - 1 for next, -1 for previous
     */
    switchNote(direction) {
        if (this.notes.length === 0) return;
        
        const currentIndex = this.notes.findIndex(note => note.id === this.currentNoteId);
        let newIndex;
        
        if (currentIndex === -1) {
            newIndex = 0; // If no note is selected, select the first one
        } else {
            newIndex = (currentIndex + direction + this.notes.length) % this.notes.length;
        }
        
        this.selectNote(this.notes[newIndex].id);
        this.noteContent.focus(); // Keep focus on textarea after switching
    }

    updateWordCount() {
        const words = this.noteContent.value.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = document.getElementById('word-count');
        wordCount.textContent = `Words: ${words.length}`;
    }

    filterNotes(query) {
        if (!query.trim()) {
            this.hideSearchResults();
            return;
        }
        const filtered = this.notes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.content.toLowerCase().includes(query.toLowerCase())
        );
        this.showSearchResults(filtered);
    }

    showSearchResults(results) {
        // Create or get search results container
        let searchResults = document.querySelector('.search-results');
        if (!searchResults) {
            searchResults = document.createElement('div');
            searchResults.className = 'search-results';
            this.searchInput.parentNode.appendChild(searchResults);
        }
        
        // Clear previous results
        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No matches found</div>';
        } else {
            results.forEach(note => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.textContent = `${note.title} - ${note.content.substring(0, 50)}...`;
                resultItem.addEventListener('click', () => {
                    this.selectNote(note.id);
                    this.hideSearchResults();
                    this.searchInput.value = '';
                });
                searchResults.appendChild(resultItem);
            });
        }
        
        searchResults.classList.add('active');
    }

    hideSearchResults() {
        const searchResults = document.querySelector('.search-results');
        if (searchResults) {
            searchResults.classList.remove('active');
        }
    }

    updateNoteTitle(note) {
        const firstLine = note.content.split('\n')[0].trim();
        note.title = firstLine.substring(0, 30) || `Note ${this.notes.length}`;
        this.updateNotesList();
    }

    showCommandPalette() {
        const palette = document.createElement('div');
        palette.className = 'command-palette';
        const commands = [
            { label: 'New Note', action: () => this.createNewNote() },
            { label: 'Delete Note', action: () => this.deleteCurrentNote() },
            // Add more commands
        ];
        // Render commands and handle selection
    }

    updateStats() {
        const text = this.noteContent.value;
        const stats = {
            words: text.trim().split(/\s+/).filter(w => w.length > 0).length,
            chars: text.length,
            lines: text.split('\n').length
        };
        this.statsSpan.textContent = 
            `Words: ${stats.words} | Chars: ${stats.chars} | Lines: ${stats.lines}`;
    }

    exportCurrentNote() {
        const note = this.notes.find(note => note.id === this.currentNoteId);
        if (!note) return;
        
        const blob = new Blob([note.content], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${note.title}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NotesManager();
}); 