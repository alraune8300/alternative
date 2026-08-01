const { Editor } = require('@tiptap/core');
const Document = require('@tiptap/extension-document');
const Paragraph = require('@tiptap/extension-paragraph');
const Text = require('@tiptap/extension-text');

const editor = new Editor({
  extensions: [Document, Paragraph, Text]
});

editor.destroy();

try {
  const c = editor.commands;
  console.log("Success calling commands");
} catch (e) {
  console.log("Error calling commands:", e.message);
}
