/// <reference types="vite/client" />

declare module 'showdown' {
  export class Converter {
    constructor(options?: any);
    makeHtml(markdown: string): string;
  }
  export interface ShowdownOptions {
    tables?: boolean;
    simplifiedAutoLink?: boolean;
    strikethrough?: boolean;
    tasklists?: boolean;
    ghCodeBlocks?: boolean;
    smoothLivePreview?: boolean;
    smartIndentationFix?: boolean;
  }
}
