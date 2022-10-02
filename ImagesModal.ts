import { App, Editor, Notice, SuggestModal, moment } from "obsidian"
import { getFetcher, Image } from "fetcher"
import { InsertMode, Orientation, PluginSettings } from "SettingTab"

const APP_NAME = encodeURIComponent("Obsidian Image Inserter Plugin")
const UTM = `utm_source=${APP_NAME}&utm_medium=referral`

export class ImagesModal extends SuggestModal<Image> {
  fetcher: {
    searchImages: (query: string, orientation: Orientation) => Promise<Image[]>,
    touchDownloadLocation: (url: string) => Promise<void>,
    downloadImage: (url: string) => Promise<ArrayBuffer>,
  }
  editor: Editor
  timer: ReturnType<typeof setTimeout>
  settings: PluginSettings

  constructor(app: App, editor: Editor, settings: PluginSettings) {
    super(app)
    this.containerEl.addClass("unsplash-selector")
    this.fetcher = getFetcher()
    this.editor = editor
    this.settings = settings
  }

  async getSuggestions(query: string): Promise<Image[]> {
    return new Promise(resolve => {
      if (this.timer) clearTimeout(this.timer)

      this.timer = setTimeout(async () => {
        try {
          const res = await this.fetcher.searchImages(query, this.settings.orientation)
          resolve(res)
        } catch {
          new Notice('Something went wrong, please contact the plugin author.');
          resolve([])
        }
      }, 500)
    })
  }

  async onChooseSuggestion(item: Image) {
    try {
      this.fetcher.touchDownloadLocation(item.downloadLocationUrl)
      const url = item.url

      const imageSize = this.settings.insertSize === "" ? "" : `|${this.settings.insertSize}`
      let nameText = `![${item.desc.slice(0, 10)}${imageSize}]`
      let urlText = `(${url})`
      const referral = `\n*Photo by [${item.author.name}](https://unsplash.com/@${item.author.username}?${UTM}) on [Unsplash](https://unsplash.com/?${UTM})*\n`

      if (this.settings.insertMode === InsertMode.local) {
        const imageName = `Inserted image ${moment().format("YYYYMMDDHHmmss")}.png`
        const arrayBuf = await this.fetcher.downloadImage(url)
        // eslint-disable-next-line
        this.app.vault.createBinary(`${(this.app.vault as any).config.attachmentFolderPath}/${imageName}`, arrayBuf)
        nameText = `![[${imageName}${imageSize}]]`
        urlText = ""
      }

      const imageTag = `${nameText}${urlText}${referral}`
      this.editor.replaceSelection(imageTag)
    } catch (e) {
      console.error(e)
      new Notice('Something went wrong, please contact the plugin author.');
    }
  }

  renderSuggestion(value: Image, el: HTMLElement) {
    const container = el.createEl("div", { attr: { style: "display: flex;" } })
    container.appendChild(el.createEl("img", { attr: { src: value.thumb, alt: value.desc } }))
  }
}

