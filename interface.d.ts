import { TFile } from "obsidian";

declare module 'obsidian' {
  interface Vault {
    getAvailablePathForAttachments: (
      fileName: string,
      extension?: string,
      currentFile?: TFile
    ) => Promise<string>;
    config: {
      attachmentFolderPath: string;
    };
  }
}
