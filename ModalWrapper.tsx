import { App, Editor, Notice, Modal } from "obsidian"
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

  onOpen() {
    const { contentEl } = this

    const root = createRoot(contentEl)
    root.render(<React.StrictMode><ImagesModal fetcher={this.fetcher} onSelect={this.onChooseSuggestion.bind(this)} /></React.StrictMode>)
  }

  onClose() {
    const { containerEl } = this
    ReactDOM.unmountComponentAtNode(containerEl);
    containerEl.empty()
  }

  createFile(name: string, binary: ArrayBuffer) {
    this.app.vault.createBinary(`${(this.app.vault as any).config.attachmentFolderPath}/${name}`, binary)
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
