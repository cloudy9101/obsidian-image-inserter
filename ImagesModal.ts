import { App, Editor, SuggestModal } from "obsidian"
import { getFetcher, Image } from "fetcher"
import { APP_NAME } from "main"

export class ImagesModal extends SuggestModal<Image> {
  fetcher: {
    searchImages: (query: string) => Promise<Image[]>
  }
  editor: Editor
  timer: ReturnType<typeof setTimeout>

  constructor(app: App, editor: Editor) {
    super(app)
    this.containerEl.addClass("unsplash-selector")
    this.fetcher = getFetcher()
    this.editor = editor
  }

  async getSuggestions(query: string): Promise<Image[]> {
    return new Promise(resolve => {
      if (this.timer) clearTimeout(this.timer)

      this.timer = setTimeout(async () => {
        const res = await this.fetcher.searchImages(query)
        resolve(res)
      }, 500)
    })
  }

  onChooseSuggestion(item: Image) {
    const utm = `utm_source=${APP_NAME}&utm_medium=referral`
    this.editor.replaceSelection(`![${item.desc.slice(0, 10)}](${item.url})\n*Photo by [${item.author.name}](https://unsplash.com/@${item.author.username}?${utm}) on [Unsplash](https://unsplash.com/?${utm})*\n`)
  }

  renderSuggestion(value: Image, el: HTMLElement) {
    const container = el.createEl("div", { attr: { style: "display: flex;" } })
    container.appendChild(el.createEl("img", { attr: { src: value.thumb, alt: value.desc } }))
  }
}

