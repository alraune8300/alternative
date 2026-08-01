import { Extension } from '@tiptap/core';

export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return { types: ['textStyle'] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.fontSize?.replace('px', '') || null,
            renderHTML: (attrs: Record<string, unknown>) => {
              if (!attrs.fontSize) return {};
              return { style: `font-size: ${attrs.fontSize}px` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize: (size: number | string) => ({ chain }: { chain: () => { setMark: (type: string, attrs: Record<string, string | null>) => { run: () => boolean } } }) =>
        chain().setMark('textStyle', { fontSize: String(size) }).run(),
      unsetFontSize: () => ({ chain }: { chain: () => { setMark: (type: string, attrs: Record<string, string | null>) => { removeEmptyTextStyle: () => { run: () => boolean } } } }) =>
        chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    } as unknown as Record<string, unknown>;
  },
});

export const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return { types: ['textStyle'] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.lineHeight || null,
            renderHTML: (attrs: Record<string, unknown>) => {
              if (!attrs.lineHeight) return {};
              return { style: `line-height: ${attrs.lineHeight}` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight: (lineHeight: number | string) => ({ chain }: { chain: () => { setMark: (type: string, attrs: Record<string, string | null>) => { run: () => boolean } } }) =>
        chain().setMark('textStyle', { lineHeight: String(lineHeight) }).run(),
      unsetLineHeight: () => ({ chain }: { chain: () => { setMark: (type: string, attrs: Record<string, string | null>) => { removeEmptyTextStyle: () => { run: () => boolean } } } }) =>
        chain().setMark('textStyle', { lineHeight: null }).removeEmptyTextStyle().run(),
    } as unknown as Record<string, unknown>;
  },
});

export const TextTransform = Extension.create({
  name: 'textTransform',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        textTransform: {
          default: null,
          parseHTML: (el) => (el as HTMLElement).style.textTransform || null,
          renderHTML: (attrs: Record<string, unknown>) => {
            if (!attrs.textTransform) return {};
            return { style: `text-transform: ${attrs.textTransform}` };
          },
        },
      },
    }];
  },
  addCommands() {
    return {
      setTextTransform: (transform: string) => ({ chain }: { chain: () => { setMark: (type: string, attrs: Record<string, string | null>) => { run: () => boolean } } }) =>
        chain().setMark('textStyle', { textTransform: transform }).run(),
    } as unknown as Record<string, unknown>;
  },
});

export const FontFeatures = Extension.create({
  name: 'fontFeatures',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontFeatureSettings: {
          default: null,
          parseHTML: (el) => (el as HTMLElement).style.fontFeatureSettings || null,
          renderHTML: (attrs: Record<string, unknown>) => {
            if (!attrs.fontFeatureSettings) return {};
            return { style: `font-feature-settings: ${attrs.fontFeatureSettings}` };
          },
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontFeatures: (features: string) => ({ chain }: { chain: () => { setMark: (type: string, attrs: Record<string, string | null>) => { run: () => boolean } } }) =>
        chain().setMark('textStyle', { fontFeatureSettings: features }).run(),
    } as unknown as Record<string, unknown>;
  },
});

export const LetterSpacing = Extension.create({
  name: 'letterSpacing',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        letterSpacing: {
          default: null,
          parseHTML: (el) => (el as HTMLElement).style.letterSpacing?.replace('px', '') || null,
          renderHTML: (attrs: Record<string, unknown>) => {
            if (!attrs.letterSpacing) return {};
            return { style: `letter-spacing: ${attrs.letterSpacing}px` };
          },
        },
      },
    }];
  },
  addCommands() {
    return {
      setLetterSpacing: (spacing: number | string) => ({ chain }: { chain: () => { setMark: (type: string, attrs: Record<string, string | null>) => { run: () => boolean } } }) =>
        chain().setMark('textStyle', { letterSpacing: String(spacing) }).run(),
    } as unknown as Record<string, unknown>;
  },
});

export const WordSpacing = Extension.create({
  name: 'wordSpacing',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        wordSpacing: {
          default: null,
          parseHTML: (el) => (el as HTMLElement).style.wordSpacing?.replace('px', '') || null,
          renderHTML: (attrs: Record<string, unknown>) => {
            if (!attrs.wordSpacing) return {};
            return { style: `word-spacing: ${attrs.wordSpacing}px` };
          },
        },
      },
    }];
  },
  addCommands() {
    return {
      setWordSpacing: (spacing: number | string) => ({ chain }: { chain: () => { setMark: (type: string, attrs: Record<string, string | null>) => { run: () => boolean } } }) =>
        chain().setMark('textStyle', { wordSpacing: String(spacing) }).run(),
    } as unknown as Record<string, unknown>;
  },
});
