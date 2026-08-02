import React from 'react';
import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import './Editor.css';
import { FontSize, LineHeight, TextTransform, FontFeatures, LetterSpacing, WordSpacing, IndentExtension } from './tiptapExtensions';
import type { ThemeColors, FormatState } from './types';
import type { Dict } from './i18n';

type Props = {
  theme: ThemeColors;
  docFont: string;
  fontSize: number;
  formatState: FormatState;
  onEditorReady?: (editor: import('@tiptap/react').Editor) => void;
  t: Dict;
  content: string;
  onContentChange: (html: string) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  isPreviewMode?: boolean;
  onTogglePreviewMode?: () => void;
};

function Editor({
  theme, docFont, fontSize, formatState, onEditorReady, t, content, onContentChange,
  isFocusMode = false,
  isPreviewMode = false,
}: Props) {
  const lastEmittedContentRef = useRef(content || '');
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbacksRef = useRef({ onContentChange, onEditorReady });
  useEffect(() => { callbacksRef.current = { onContentChange, onEditorReady }; }, [onContentChange, onEditorReady]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, horizontalRule: {} }),
      TextStyle, FontFamily, FontSize, LineHeight, TextTransform, FontFeatures, LetterSpacing, WordSpacing, Superscript, Subscript, IndentExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: content || '',
    autofocus: 'end',
    onCreate: ({ editor }) => {
      if (callbacksRef.current.onEditorReady) callbacksRef.current.onEditorReady(editor);
      requestAnimationFrame(() => {
        if (editor && !editor.isDestroyed) {
          editor?.commands?.focus('end');
        }
      });
    },
    onSelectionUpdate: ({ editor }) => {
      if (callbacksRef.current.onEditorReady) callbacksRef.current.onEditorReady(editor);
    },
    onBlur: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedContentRef.current = html;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      callbacksRef.current.onContentChange(html);
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedContentRef.current = html;
      
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        callbacksRef.current.onContentChange(html);
      }, 400);
    },
    editorProps: {
      attributes: {
        class: 'kgv-editor kgv-caret text-left direction-ltr pointer-events-auto user-select-text',
        style: `color: ${theme.text}; caret-color: ${theme.text}; line-height: 1.7;`,
        'data-placeholder': t.startWriting,
        dir: 'ltr',
        autocorrect: 'off',
        autocapitalize: 'off',
        spellcheck: 'false',
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Tab') {
          event.preventDefault();
          if (editor && !editor.isDestroyed && typeof editor.commands === 'object') {
            const cmds = editor.commands as unknown as { indent?: () => boolean; outdent?: () => boolean };
            if (event.shiftKey) {
              cmds.outdent?.();
            } else {
              cmds.indent?.();
            }
          }
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isPreviewMode);
    }
  }, [editor, isPreviewMode]);

  useEffect(() => {
    if (editor && !editor.isDestroyed && content !== lastEmittedContentRef.current && editor.getHTML() !== content) {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      const newContent = content || '';
      editor?.commands?.setContent(newContent, { emitUpdate: false });
      lastEmittedContentRef.current = content || '';
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        attributes: {
          class: 'kgv-editor kgv-caret text-left direction-ltr pointer-events-auto user-select-text',
          style: `color: ${theme.text}; caret-color: ${theme.text}; line-height: ${(isPreviewMode || isFocusMode) ? '1.8' : '1.7'}; min-height: 100%;`,
          'data-placeholder': t.startWriting,
          dir: 'ltr',
          autocorrect: 'off',
          autocapitalize: 'off',
          spellcheck: 'false',
        },
      },
    });
  }, [editor, theme.text, t.startWriting, isPreviewMode, isFocusMode]);

  useEffect(() => {
    function handleDocFont(e: Event) {
      editor?.chain().focus().setFontFamily((e as CustomEvent).detail as string).run();
    }
    window.addEventListener('kgv-docfont', handleDocFont);
    return () => window.removeEventListener('kgv-docfont', handleDocFont);
  }, [editor]);

  useEffect(() => {
    function handleFontSelection(e: Event) {
      editor?.chain().focus().setFontFamily((e as CustomEvent).detail as string).run();
    }
    window.addEventListener('kgv-apply-font-selection', handleFontSelection);
    return () => window.removeEventListener('kgv-apply-font-selection', handleFontSelection);
  }, [editor]);

  useEffect(() => {
    function handleFontSize(e: Event) {
      editor?.chain().focus().setFontSize(String((e as CustomEvent).detail as number)).run();
    }
    window.addEventListener('kgv-fontsize', handleFontSize);
    return () => window.removeEventListener('kgv-fontsize', handleFontSize);
  }, [editor]);

  
  if (!editor) return null;

  return (
    <div className="flex flex-col h-full relative">
      {/* Central Editor Container */}
      <div
        className="flex-1 overflow-y-auto kgv-scroll transition-all duration-300 ease-in-out relative flex justify-center cursor-text"
        onClick={(e) => {
          if (!isPreviewMode && editor && !editor.isDestroyed) {
            const target = e.target as HTMLElement;
            if (!target.closest('button') && !target.closest('a') && !target.closest('input') ) {
              if (!editor.isFocused) {
                editor?.commands?.focus('end');
              }
            }
          }
        }}
      >
        <div
          className={`relative w-full mx-auto transition-all duration-300 ease-in-out ${
            (isPreviewMode || isFocusMode)
              ? 'px-4 sm:px-8 md:px-12 pt-6 pb-20 font-serif tracking-normal'
              : 'px-4 sm:px-6 md:px-8 pt-6 pb-24'
          }`}
          style={{
            fontFamily: `'${formatState?.fontFam || docFont}', Georgia, serif`,
            fontSize: `${formatState?.fontSize || fontSize}px`,
            lineHeight: (isPreviewMode || isFocusMode) ? 1.8 : (formatState?.lineH || 1.7),
          }}
        >
          <EditorContent editor={editor} />
          
        </div>
      </div>
    </div>
  );
}

export default React.memo(Editor);
