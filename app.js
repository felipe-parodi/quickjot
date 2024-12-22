class Note {
    constructor(id, title, content, lastModified = new Date()) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.lastModified = lastModified;
    }
}

class NotesManager {
    constructor() {
        this.noteContent = document.getElementById('note-content');
        this.noteSelector = document.getElementById('note-selector');
        this.searchInput = document.getElementById('search-input');
        this.newNoteBtn = document.getElementById('new-note');
        this.deleteNoteBtn = document.getElementById('delete-note');
        this.lastModifiedSpan = document.getElementById('last-modified');
        
        this.currentNoteId = null;
        this.notes = this.loadNotes();
        
        this.initializeEventListeners();
        this.updateNotesList();
        this.initializeKeyboardShortcuts();
    }

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

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    createNewNote() {
        const noteId = Date.now().toString();
        const noteTitle = `Note ${this.notes.length + 1}`;
        const newNote = new Note(noteId, noteTitle, '');
        this.notes.push(newNote);
        this.saveNotes();
        this.updateNotesList();
        this.selectNote(noteId);
        this.noteContent.disabled = false;
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

    updateNotesList() {
        this.noteSelector.innerHTML = '<option value="">Select a note...</option>';
        this.notes.forEach(note => {
            const option = document.createElement('option');
            option.value = note.id;
            option.textContent = note.title;
            if (note.id === this.currentNoteId) {
                option.selected = true;
            }
            this.noteSelector.appendChild(option);
        });
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
    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + E: New Note
            if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
                e.preventDefault();
                this.createNewNote();
            }
            
            // Cmd/Ctrl + X: Delete Note
            if ((e.metaKey || e.ctrlKey) && e.key === 'x') {
                e.preventDefault();
                this.deleteCurrentNote();
            }
            
            // Cmd/Ctrl + P: Show Command Palette
            if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
                e.preventDefault();
                this.showCommandPalette();
            }
            
            // Cmd/Ctrl + S: Export Note
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                this.exportCurrentNote();
            }
        });
    }

    updateWordCount() {
        const words = this.noteContent.value.trim().split(/\s+/).filter(word => word.length > 0);
        const wordCount = document.getElementById('word-count');
        wordCount.textContent = `Words: ${words.length}`;
    }

    filterNotes(query) {
        const filtered = this.notes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.content.toLowerCase().includes(query.toLowerCase())
        );
        this.updateNotesList(filtered);
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