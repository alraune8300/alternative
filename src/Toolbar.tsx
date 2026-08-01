import React, { useState, useEffect } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Indent, Outdent,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Eraser, Plus, Minus,
  PanelLeft, Settings, Maximize2, Minimize2, BookOpen,
  Divide,
} from 'lucide-react';
import type { Editor } from '@tiptap/react';
import type { ThemeColors } from './types';
import type { Dict } from './i18n';

type Props = {
  editor: Editor;
  theme: ThemeColors;
  uiFont: string;
  t: Dict;
  selectedFont: string;
  selectedSize: number;
  availableFonts: { family: string; label: string }[];
    onFontChange: (family: string) => void;
  onSizeChange: (size: number) => void;
  onSizeInput: (size: number) => void;
      sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  rightOpen?: boolean;
  onToggleSettings?: () => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  isPreviewMode?: boolean;
  onTogglePreviewMode?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

function Toolbar({
  editor, theme, uiFont, t,
  selectedFont, selectedSize, availableFonts,
    onFontChange, onSizeChange, onSizeInput,
    sidebarOpen, onToggleSidebar,
  rightOpen, onToggleSettings,
  isFocusMode, onToggleFocusMode,
  isPreviewMode, onTogglePreviewMode,
  onUndo, onRedo, canUndo, canRedo,
}: Props) {
  const [sizeInput, setSizeInput] = useState<string>(String(selectedSize));
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (editor) {
      const handleUpdate = () => {
        const sz = editor.getAttributes("textStyle")?.fontSize?.replace("px", "") || selectedSize;
        setSizeInput(String(sz));
        forceUpdate({});
      };
      editor.on("transaction", handleUpdate);
      return () => { editor.off("transaction", handleUpdate); };
    } else {
      setSizeInput(String(selectedSize));
    }
  }, [editor, selectedSize]);

  const commitSizeInput = () => {
    const v = parseInt(sizeInput, 10);
    if (!isNaN(v)) {
      const clamped = Math.max(8, Math.min(96, v));
      onSizeInput(clamped);
      setSizeInput(String(clamped));
    } else {
      setSizeInput(String(selectedSize));
    }
  };

  const ToolBtn = ({ onClick, icon, label, active }: {
    onClick: () => void; icon: React.ReactNode; label: string; active?: boolean;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors hover:opacity-80 ${active ? 'kgv-track-active' : ''}`}
      style={{ color: active ? undefined : theme.muted }}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );

  const Divider = () => <div className="w-px h-5 mx-1" style={{ backgroundColor: theme.border }} />;

  return (
    <div
      className="sticky top-0 z-10 flex items-center flex-wrap gap-0.5 px-3 py-2"
      style={{ background: theme.bg, borderBottom: `1px solid ${theme.border}`, fontFamily: `'${uiFont}', sans-serif` }}
    >
      {onToggleSidebar && (
        <>
          <ToolBtn
            onClick={onToggleSidebar}
            icon={<PanelLeft size={16} />}
            label={sidebarOpen ? (t.collapse || 'Collapse Sidebar') : (t.openSidebar || 'Open Sidebar')}
            active={sidebarOpen}
          />
          <Divider />
        </>
      )}

      <button
        type="button"
        onMouseDown={e => e.preventDefault()}
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        style={{ padding: '4px 8px', background: 'none', border: 'none', cursor: canUndo ? 'pointer' : 'default', opacity: canUndo ? 1 : 0.4, color: theme.text, fontFamily: uiFont, fontSize: '0.85rem' }}
      >
        ⟲
      </button>
      <button
        type="button"
        onMouseDown={e => e.preventDefault()}
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        style={{ padding: '4px 8px', background: 'none', border: 'none', cursor: canRedo ? 'pointer' : 'default', opacity: canRedo ? 1 : 0.4, color: theme.text, fontFamily: uiFont, fontSize: '0.85rem' }}
      >
        ⟳
      </button>
      <Divider />

      {(() => {
        const currentFont = editor ? editor.getAttributes('textStyle').fontFamily || selectedFont : selectedFont;
        const serifFamilies = ['Merriweather', 'Lora', 'Playfair Display', 'EB Garamond', 'Libre Baskerville', 'Times New Roman', 'Georgia'];
        const monoFamilies = ['JetBrains Mono', 'Courier New'];
        const serifFonts = availableFonts.filter(f => serifFamilies.includes(f.family));
        const monoFonts = availableFonts.filter(f => monoFamilies.includes(f.family));
        const sansFonts = availableFonts.filter(f => !serifFamilies.includes(f.family) && !monoFamilies.includes(f.family));

        return (
          <select
            value={currentFont}
            onChange={(e) => onFontChange(e.target.value)}
            className="text-xs py-1.5 px-2 rounded-md outline-none cursor-pointer mr-1 max-w-[140px]"
            style={{ backgroundColor: theme.isDark ? theme.surface : theme.accentSoft, color: theme.text, border: `1px solid ${theme.border}` }}
            title={t.fontName || 'Font Family'}
          >
            {serifFonts.length > 0 && (
              <optgroup label="[SERIF]">
                {serifFonts.map((f) => (
                  <option key={f.family} value={f.family} style={{ backgroundColor: theme.isDark ? '#1f2937' : '#ffffff', color: theme.text, fontFamily: `'${f.family}', serif` }}>{f.label}</option>
                ))}
              </optgroup>
            )}
            {sansFonts.length > 0 && (
              <optgroup label="[SANS-SERIF]">
                {sansFonts.map((f) => (
                  <option key={f.family} value={f.family} style={{ backgroundColor: theme.isDark ? '#1f2937' : '#ffffff', color: theme.text, fontFamily: `'${f.family}', sans-serif` }}>{f.label}</option>
                ))}
              </optgroup>
            )}
            {monoFonts.length > 0 && (
              <optgroup label="[MONOSPACE]">
                {monoFonts.map((f) => (
                  <option key={f.family} value={f.family} style={{ backgroundColor: theme.isDark ? '#1f2937' : '#ffffff', color: theme.text, fontFamily: `'${f.family}', monospace` }}>{f.label}</option>
                ))}
              </optgroup>
            )}
          </select>
        );
      })()}

      <div className="flex items-center gap-0.5 mr-1">
        <ToolBtn onClick={() => onSizeChange(-1)} icon={<Minus size={13} />} label="-" />
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={sizeInput}
          onChange={(e) => {
            const val = e.target.value;
            setSizeInput(val);
            const num = parseInt(val, 10);
            if (!isNaN(num) && num >= 8 && num <= 96 && val.length >= 2) {
              onSizeInput(num);
            }
          }}
          onBlur={commitSizeInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitSizeInput();
            }
          }}
          className="w-10 text-xs font-medium text-center py-0.5 rounded outline-none focus:ring-1"
          style={{ backgroundColor: theme.accentSoft, color: theme.text, border: `1px solid ${theme.border}` }}
          title={t.fontSize}
        />
        <ToolBtn onClick={() => onSizeChange(1)} icon={<Plus size={13} />} label="+" />
      </div>

      <Divider />

      <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} icon={<Bold size={15} />} label={t.bold} active={editor.isActive('bold')} />
      <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} icon={<Italic size={15} />} label={t.italic} active={editor.isActive('italic')} />
      <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} icon={<UnderlineIcon size={15} />} label={t.underline} active={editor.isActive('underline')} />
      <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} icon={<Strikethrough size={15} />} label={t.strike} active={editor.isActive('strike')} />

      <Divider />

      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} icon={<Heading1 size={15} />} label={t.h1} active={editor.isActive('heading', { level: 1 })} />
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} icon={<Heading2 size={15} />} label={t.h2} active={editor.isActive('heading', { level: 2 })} />
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} icon={<Heading3 size={15} />} label={t.h3} active={editor.isActive('heading', { level: 3 })} />

      <Divider />

      <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} icon={<List size={15} />} label={t.bulletList} active={editor.isActive('bulletList')} />
      <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} icon={<ListOrdered size={15} />} label={t.numberList} active={editor.isActive('orderedList')} />
      <ToolBtn onClick={() => editor.chain().focus().sinkListItem('listItem').run()} icon={<Indent size={15} />} label={t.indent} />
      <ToolBtn onClick={() => editor.chain().focus().liftListItem('listItem').run()} icon={<Outdent size={15} />} label={t.outdent} />

      <Divider />

      <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} icon={<AlignLeft size={15} />} label={t.alignLeft} active={editor.isActive({ textAlign: 'left' })} />
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} icon={<AlignCenter size={15} />} label={t.alignCenter} active={editor.isActive({ textAlign: 'center' })} />
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} icon={<AlignRight size={15} />} label={t.alignRight} active={editor.isActive({ textAlign: 'right' })} />
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} icon={<AlignJustify size={15} />} label={t.alignJustify} active={editor.isActive({ textAlign: 'justify' })} />

      <Divider />

      <ToolBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} icon={<Eraser size={15} />} label={t.clearFormat} />
      <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={<Divide size={15} />} label="Horizontal Rule" />

      <Divider />

            
      <div className="ml-auto flex items-center gap-0.5">
        {onToggleFocusMode && (
          <ToolBtn
            onClick={onToggleFocusMode}
            icon={isFocusMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            label={isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
            active={isFocusMode}
          />
        )}
        {onTogglePreviewMode && (
          <ToolBtn
            onClick={onTogglePreviewMode}
            icon={<BookOpen size={16} />}
            label={isPreviewMode ? 'Exit Preview Mode' : 'Preview Mode'}
            active={isPreviewMode}
          />
        )}
        {onToggleSettings && (
          <>
            <Divider />
            <ToolBtn
              onClick={onToggleSettings}
              icon={<Settings size={16} />}
              label={t.settings || 'Settings'}
              active={rightOpen}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default React.memo(Toolbar);
