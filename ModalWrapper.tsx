import { App, Editor, Notice, Modal, FileView } from "obsidian"
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createRoot } from "react-dom/client"

import { getFetcher, Image } from "./fetcher"
import { ImagesModal } from "./ImagesModal"
import { PluginSettings } from "./SettingTab"

export class ModalWrapper extends Modal {
  editor: Editor
  fetcher: ReturnType<typeof getFetcher>

  constructor(app: App, editor: Editor, settings: PluginSettings) {
    super(app)
    this.editor = editor
    this.fetcher = getFetcher(settings)
    this.containerEl.addClass("image-inserter-container")
  }

  async onOpen() {
    const { contentEl } = this

    const root = createRoot(contentEl)
    root.render(<React.StrictMode><ImagesModal fetcher={this.fetcher} onSelect={this.onChooseSuggestion.bind(this)} /></React.StrictMode>)
  }

  onClose() {
    const { containerEl } = this
    ReactDOM.unmountComponentAtNode(containerEl);
    containerEl.empty()
  }

  async createFile(name: string, ext: string, binary: ArrayBuffer) {
    const file = this.app.workspace.getActiveFile()
    if (file === null) {
      throw "No active file"
    }
    const filePath = await this.app.vault.getAvailablePathForAttachments(name, ext, file)

    this.app.vault.createBinary(filePath, binary)
  }

  async onChooseSuggestion(item: Image) {
    try {
      const imageTag = await this.fetcher.downloadAndInsertImage(item, this.createFile.bind(this))

      this.editor.replaceSelection(imageTag)

      this.close()
    } catch (e) {
      console.error(e)
      new Notice('Something went wrong, please contact the plugin author.');
    }
  }
}
