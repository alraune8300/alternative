import React from 'react';
import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import {
  Minimize2, X,
} from 'lucide-react';
import './Editor.css';
import { FontSize, LineHeight, TextTransform, FontFeatures, LetterSpacing, WordSpacing } from './tiptapExtensions';
import type { ThemeColors, FormatState } from './types';
import type { Dict } from './i18n';
import type {  } from './types';

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
    isFocusMode = false, onToggleFocusMode,
  isPreviewMode = false, onTogglePreviewMode,
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
      TextStyle, FontFamily, FontSize, LineHeight, TextTransform, FontFeatures, LetterSpacing, WordSpacing, Superscript, Subscript,
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
          if (event.shiftKey) {
            if (editor && !editor.isDestroyed && typeof editor.can === 'function' && editor.can().liftListItem('listItem')) {
              editor.chain().focus().liftListItem('listItem').run();
            }
          } else {
            if (editor && !editor.isDestroyed && typeof editor.can === 'function' && editor.can().sinkListItem('listItem')) {
              editor.chain().focus().sinkListItem('listItem').run();
            } else {
              editor?.chain().focus().insertContent('\u00a0\u00a0\u00a0\u00a0').run();
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
          style: `color: ${theme.text}; caret-color: ${theme.text}; line-height: ${isPreviewMode ? '2.0' : '1.7'}; min-height: 100%;`,
          'data-placeholder': t.startWriting,
          dir: 'ltr',
          autocorrect: 'off',
          autocapitalize: 'off',
          spellcheck: 'false',
        },
      },
    });
  }, [editor, theme.text, t.startWriting, isPreviewMode]);

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

      {/* Floating minimalist exit button for Focus Mode */}
      {isFocusMode && !isPreviewMode && onToggleFocusMode && (
        <div className="fixed top-5 right-5 z-50">
          <button
            type="button"
            onClick={onToggleFocusMode}
            title="Exit Focus Mode"
            aria-label="Exit Focus Mode"
            className="p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center border"
            style={{
              backgroundColor: theme.isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
              borderColor: theme.border,
              color: theme.text,
            }}
          >
            <Minimize2 size={18} />
          </button>
        </div>
      )}

      {/* Floating minimalist exit button for Preview Mode */}
      {isPreviewMode && onTogglePreviewMode && (
        <div className="fixed top-5 right-5 z-50">
          <button
            type="button"
            onClick={onTogglePreviewMode}
            title="Exit Preview Mode"
            aria-label="Exit Preview Mode"
            className="p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center border"
            style={{
              backgroundColor: theme.isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
              borderColor: theme.border,
              color: theme.text,
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

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
            isPreviewMode
              ? 'max-w-3xl px-8 md:px-16 pt-12 pb-40 text-lg leading-relaxed font-serif tracking-normal'
              : isFocusMode
              ? 'max-w-3xl px-6 md:px-10 pt-16 pb-36'
              : 'max-w-2xl px-6 md:px-8 pt-10 pb-32'
          }`}
          style={{
            fontFamily: `'${formatState?.fontFam || docFont}', Georgia, serif`,
            fontSize: isPreviewMode ? `${Math.max(formatState?.fontSize || fontSize, 20)}px` : `${formatState?.fontSize || fontSize}px`,
            lineHeight: isPreviewMode ? 2.0 : (formatState?.lineH || 1.7),
          }}
        >
          <EditorContent editor={editor} />
          
        </div>
      </div>
    </div>
  );
}

export default React.memo(Editor);
