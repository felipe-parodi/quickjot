# notes for cursor

Project: QuicJot - A Lightweight Browser-Based Note-Taking App

Objective: Create a simple, fast, and persistent note-taking application that runs entirely in the browser using HTML, CSS, and JavaScript. Notes should be automatically saved and reloaded using the browser's localStorage.

Instructions for the LLM (using Cursor IDE):

Project Setup:

Create a new, empty folder for the project. Name it quicjot.
Inside the quicjot folder, create three files:
index.html
style.css
app.js
HTML Structure (index.html):

Use Cursor's code generation capabilities to create the basic structure of an HTML5 document.
Prompt: "Generate a basic HTML5 document with a title 'QuicJot', a linked stylesheet 'style.css', and a linked JavaScript file 'app.js'."
Inside the <body>, create a single <textarea> element.
Give the <textarea> an id of "note-content".
HTML

<!DOCTYPE html>
<html>
<head>
    <title>QuicJot</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <textarea id="note-content"></textarea>
    <script src="app.js"></script>
</body>
</html>
CSS Styling (style.css):

Prompt Cursor to generate CSS to style the <body> and <textarea>.
Prompt: "Generate CSS to set the body font to 'Comic Sans MS', cursive, sans-serif, with a margin of 20px. Style the textarea to take up most of the screen width (e.g., 95%) and a significant portion of the screen height (e.g., 80vh). Add padding and a subtle border to the textarea."
Ensure that you include:
font-family: 'Comic Sans MS', cursive, sans-serif; for the body
width: 95%; and height: 80vh; (or similar) for the textarea
Basic styling like padding and border for a visually appealing look.
CSS

body {
    font-family: 'Comic Sans MS', cursive, sans-serif;
    margin: 20px;
}

textarea {
    width: 95%;
    height: 80vh;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
}
JavaScript Logic (app.js):

Get the Textarea:

Prompt: "Get the textarea element with the id 'note-content' and store it in a variable named 'noteContent'."
JavaScript

const noteContent = document.getElementById('note-content');
Load Saved Content:

Prompt: "Retrieve saved content from localStorage under the key 'note'. If content exists, set the value of the 'noteContent' textarea to the retrieved content."
JavaScript

const savedContent = localStorage.getItem('note');
if (savedContent) {
    noteContent.value = savedContent;
}
Auto-Save Functionality:

Prompt: "Add an event listener to the 'noteContent' textarea that triggers on the 'input' event. Inside the event listener, save the current value of the textarea to localStorage under the key 'note'."
JavaScript

noteContent.addEventListener('input', () => {
    localStorage.setItem('note', noteContent.value);
});
Testing:

Open index.html in a web browser.
Type some text into the textarea.
Close the browser tab or window.
Re-open index.html.
Verify that the text you typed is still there.
Optional Enhancements (if the LLM can handle it):

Multiple Notes:
Add HTML elements for note titles (e.g., a <select> dropdown or a simple list).
Modify the JavaScript to manage multiple notes, each with a unique ID, storing them as an array or object in localStorage.
Allow creating, deleting, and switching between notes.
Timestamps:
Store the last modified timestamp for each note.
Display the timestamp in the UI.
Important Considerations for the LLM:

Use Cursor's AI features: Leverage Cursor's code generation, auto-completion, and any AI-powered editing or refactoring tools to your advantage.
Prompt Clearly: Provide specific instructions to the LLM, breaking down the task into smaller, manageable steps.
Iterative Development: Build the app incrementally, testing each part before moving on to the next.
Error Handling: While not strictly necessary for this simple app, you can guide the LLM to add basic error handling if it's capable (e.g., checking if localStorage is available).
