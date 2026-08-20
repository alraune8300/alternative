import React from 'react';
import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { ResizableImage } from './tiptapExtensions';
import './Editor.css';
import { FontSize, LineHeight, TextTransform, FontFeatures, LetterSpacing, WordSpacing, IndentExtension } from './tiptapExtensions';
import type { ThemeColors, FormatState } from './types';
import type { Dict } from './i18n';

type Props = {
  theme: ThemeColors;
  docFont: string;
  headingFont?: string;
  monoFont?: string;
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
  typewriterMode?: boolean;
};

function Editor({
  theme, docFont, headingFont, monoFont, fontSize, formatState, onEditorReady, t, content, onContentChange,
  isFocusMode = false,
  isPreviewMode = false,
  typewriterMode = false,
}: Props) {
  const lastEmittedContentRef = useRef(content || '');
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbacksRef = useRef({ onContentChange, onEditorReady, typewriterMode });
  const handleTypewriterScroll = (editor: import("@tiptap/react").Editor) => {
    if (!callbacksRef.current.typewriterMode) return;
    requestAnimationFrame(() => {
      try {
        const view = editor.view;
        const state = editor.state;
        if (!state.selection.empty) return; // Skip if text is selected
        const coords = view.coordsAtPos(state.selection.head);
        const scrollContainer = document.querySelector(".kgv-scroll");
        if (coords && scrollContainer) {
          if (scrollContainer.scrollHeight > scrollContainer.clientHeight) {
            const containerRect = scrollContainer.getBoundingClientRect();
            const caretY = coords.top - containerRect.top + scrollContainer.scrollTop;
            const targetScroll = caretY - (containerRect.height / 2);
            scrollContainer.scrollTo({ top: targetScroll, behavior: "smooth" });
          }
        }
      } catch (e) {
        console.warn('Typewriter scroll calculation failed:', e);
      }
    });
  };
  useEffect(() => { callbacksRef.current = { onContentChange, onEditorReady, typewriterMode }; }, [onContentChange, onEditorReady, typewriterMode]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        callbacksRef.current.onContentChange(lastEmittedContentRef.current);
      }
    };
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, horizontalRule: {} }),
      TextStyle, FontFamily, FontSize, LineHeight, TextTransform, FontFeatures, LetterSpacing, WordSpacing, Superscript, Subscript, IndentExtension, ResizableImage,
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
      handleTypewriterScroll(editor);
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
      
      handleTypewriterScroll(editor);

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(() => {
        callbacksRef.current.onContentChange(html);
      }, 400);
    },
    onTransaction: ({ transaction }) => {
      // Keep scroll coordinates locked when selections change from external formatting commands
      // Only apply this logic if the document hasn't changed (e.g., purely a selection change like Ctrl+A)
      // or if it's explicitly flagged, to avoid layout thrashing (synchronous reflows) on every single keystroke.
      if (transaction.selectionSet && !transaction.docChanged && !callbacksRef.current.typewriterMode) {
        const scrollContainer = document.querySelector('.kgv-scroll');
        if (scrollContainer) {
          const prevScroll = scrollContainer.scrollTop;
          requestAnimationFrame(() => {
            // Restore scroll position to prevent dramatic jumps on selection / Select All
            if (scrollContainer && Math.abs(scrollContainer.scrollTop - prevScroll) > 15) {
              scrollContainer.scrollTop = prevScroll;
            }
          });
        }
      }
    },
    editorProps: {
      handleScrollToSelection: (view) => {
        // Prevent ProseMirror auto-scrolling when formatting or making selections via Select All
        // if the active element is not the editor's text area (e.g., toolbar button clicks)
        if (document.activeElement && !view.dom.contains(document.activeElement)) {
          return true; // block default scrolling behavior
        }
        return false;
      },
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
          if (editor && !editor.isDestroyed) {
            const cmds = editor.commands as Record<string, (...args: unknown[]) => boolean>;
            if (event.shiftKey) {
              if (!cmds.liftListItem('listItem')) {
                cmds.outdent?.();
              }
            } else {
              if (!cmds.sinkListItem('listItem')) {
                cmds.indent?.();
              }
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
    const activeFontSize = formatState?.fontSize || fontSize || 16;
    const activeLineHeightVal = (isPreviewMode || isFocusMode) ? 1.8 : (formatState?.lineH || 1.7);
    const absLineHeight = Math.round(activeFontSize * activeLineHeightVal);

    editor.setOptions({
      editorProps: {
        attributes: {
          class: 'kgv-editor kgv-caret text-left direction-ltr pointer-events-auto user-select-text',
          style: `color: ${theme.text}; caret-color: ${theme.text}; font-size: ${activeFontSize}px; line-height: ${absLineHeight}px; min-height: 100%;`,
          'data-placeholder': t.startWriting,
          dir: 'ltr',
          autocorrect: 'off',
          autocapitalize: 'off',
          spellcheck: 'false',
        },
      },
    });
  }, [editor, theme.text, t.startWriting, isPreviewMode, isFocusMode, formatState, fontSize]);

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

  const isPaginated = !isPreviewMode && !isFocusMode;
  const currentBodyFont = formatState?.fontFam || docFont || 'Merriweather';
  const currentHeadingFont = formatState?.headingFontFam || headingFont || 'Playfair Display';
  const currentMonoFont = formatState?.monoFontFam || monoFont || 'JetBrains Mono';

  if (isPaginated) {
    const activeFontSize = formatState?.fontSize || fontSize || 16;
    const activeLineHeightVal = formatState?.lineH || 1.7;
    const absLineHeight = Math.round(activeFontSize * activeLineHeightVal);

    return (
      <div 
        className="w-full h-full relative pointer-events-auto" 
        style={{ 
          color: theme.text,
          fontFamily: `'${currentBodyFont}', Georgia, serif`,
          fontSize: `${activeFontSize}px`,
          lineHeight: `${absLineHeight}px`,
          ['--kgv-body-font' as string]: `'${currentBodyFont}', Georgia, serif`,
          ['--kgv-heading-font' as string]: `'${currentHeadingFont}', serif`,
          ['--kgv-mono-font' as string]: `'${currentMonoFont}', monospace`,
        } as React.CSSProperties}
      >
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Central Editor Container */}
      <div
        className="flex-1 overflow-y-auto kgv-scroll transition-all duration-300 ease-in-out relative flex justify-center cursor-text"
        style={{ overscrollBehaviorY: 'none' }}
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
              ? 'px-4 sm:px-8 md:px-12 pt-6 pb-20 tracking-normal'
              : 'px-4 sm:px-6 md:px-8 pt-6 pb-24'
          }`}
          style={{
            fontFamily: `'${currentBodyFont}', Georgia, serif`,
            fontSize: `${formatState?.fontSize || fontSize}px`,
            lineHeight: `${Math.round((formatState?.fontSize || fontSize || 16) * ((isPreviewMode || isFocusMode) ? 1.8 : (formatState?.lineH || 1.7)))}px`,
            ['--kgv-body-font' as string]: `'${currentBodyFont}', Georgia, serif`,
            ['--kgv-heading-font' as string]: `'${currentHeadingFont}', serif`,
            ['--kgv-mono-font' as string]: `'${currentMonoFont}', monospace`,
          } as React.CSSProperties}
        >
          <EditorContent editor={editor} />
          
        </div>
      </div>
    </div>
  );
}

export default React.memo(Editor);
