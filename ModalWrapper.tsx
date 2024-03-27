import { upsert } from "meta-updater";
import { App, Editor, Notice, Modal } from "obsidian";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";

import { getFetcher } from "./fetchers";
import { Fetcher, Image } from "./fetchers/constants";
import { ImagesModal } from "./ImagesModal";
import { PluginSettings } from "./SettingTab";

export enum InsertPlace {
  default = "default",
  frontmatter = "frontmatter",
}

export class ModalWrapper extends Modal {
  editor: Editor;
  fetcher: ReturnType<typeof getFetcher>;
  settings: PluginSettings;
  insertPlace: InsertPlace;

  constructor(
    app: App,
    editor: Editor,
    settings: PluginSettings,
    insertPlace: InsertPlace = InsertPlace.default,
  ) {
    super(app);
    this.editor = editor;
    this.settings = {
      ...settings,
      useMarkdownLinks: app.vault.config.useMarkdownLinks,
    };
    this.fetcher = getFetcher(this.settings, app.vault);
    this.insertPlace = insertPlace;
    this.containerEl.addClass("image-inserter-container");
  }

  onFetcherChange(fetcher: Fetcher) {
    this.fetcher = fetcher;
  }

  async onOpen() {
    const { contentEl } = this;

    const root = createRoot(contentEl);
    root.render(
      <React.StrictMode>
        <ImagesModal
          fetcher={this.fetcher}
          onFetcherChange={this.onFetcherChange.bind(this)}
          settings={this.settings}
          onSelect={this.onChooseSuggestion.bind(this)}
        />
      </React.StrictMode>,
    );
  }

  onClose() {
    const { containerEl } = this;
    ReactDOM.unmountComponentAtNode(containerEl);
    containerEl.empty();
  }

  async createFile(name: string, ext: string, binary: ArrayBuffer) {
    const file = this.app.workspace.getActiveFile();
    if (file === null) {
      throw "No active file";
    }
    const filePath = await this.app.vault.getAvailablePathForAttachments(
      name,
      ext,
      file,
    );

    this.app.vault.createBinary(filePath, binary);
  }

  async onChooseSuggestion(item: Image) {
    try {
      if (this.insertPlace === InsertPlace.default) {
        const imageTag = await this.fetcher.downloadAndInsertImage(
          item,
          this.createFile.bind(this),
        );
        this.editor.replaceSelection(imageTag);
      }
      if (this.insertPlace === InsertPlace.frontmatter) {
        const { url: imageTag, referral } =
          await this.fetcher.downloadAndGetUri(
            item,
            this.createFile.bind(this),
          );
        const file = this.app.workspace.getActiveFile();
        if (file) {
          const updatedContent = await upsert(
            this.app,
            file,
            this.settings.frontmatter.key,
            `"${this.settings.frontmatter.valueFormat.replace(
              "{image-url}",
              imageTag,
            )}"`,
          );
          await this.app.vault.modify(
            file,
            this.settings.frontmatter.appendReferral
              ? [updatedContent, referral].join("\n")
              : updatedContent,
          );
        }
      }

      this.close();
    } catch (e) {
      console.error(e);
      new Notice("Something went wrong, please contact the plugin author.");
    }
  }
}
