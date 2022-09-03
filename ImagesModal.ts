import { App, Editor, SuggestModal } from "obsidian"
import { getFetcher, Image } from "fetcher"
import { InsertMode, Orientation } from "SettingTab"

const APP_NAME = encodeURIComponent("Obsidian Image Inserter Plugin")
const UTM = `utm_source=${APP_NAME}&utm_medium=referral`

export class ImagesModal extends SuggestModal<Image> {
  fetcher: {
    searchImages: (query: string, orientation: Orientation) => Promise<Image[]>,
    touchDownloadLocation: (url: string) => Promise<void>,
  }
  editor: Editor
  timer: ReturnType<typeof setTimeout>
  settings: {
    insertMode: InsertMode,
    orientation: Orientation,
  }

  constructor(app: App, editor: Editor, settings: {
    insertMode: InsertMode,
    orientation: Orientation,
  }) {
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
        const res = await this.fetcher.searchImages(query, this.settings.orientation)
        resolve(res)
      }, 500)
    })
  }

  onChooseSuggestion(item: Image) {
    this.fetcher.touchDownloadLocation(item.downloadLocationUrl)
    const url = item.url
    this.editor.replaceSelection(`![${item.desc.slice(0, 10)}](${url})\n*Photo by [${item.author.name}](https://unsplash.com/@${item.author.username}?${UTM}) on [Unsplash](https://unsplash.com/?${UTM})*\n`)
  }

  renderSuggestion(value: Image, el: HTMLElement) {
    const container = el.createEl("div", { attr: { style: "display: flex;" } })
    container.appendChild(el.createEl("img", { attr: { src: value.thumb, alt: value.desc } }))
  }
}

