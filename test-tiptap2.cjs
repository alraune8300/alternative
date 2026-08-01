const { Editor } = require('@tiptap/core');
const Document = require('@tiptap/extension-document');
const Paragraph = require('@tiptap/extension-paragraph');
const Text = require('@tiptap/extension-text');

const editor = new Editor({
  extensions: [Document, Paragraph, Text]
});

editor.destroy();

try {
  editor.can();
  console.log("Success calling can()");
} catch (e) {
  console.log("Error calling can():", e.message);
}

try {
  let c = editor.can;
  console.log("Success accessing can:", typeof c);
} catch (e) {
  console.log("Error accessing can:", e.message);
}

