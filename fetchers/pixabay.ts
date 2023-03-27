import { moment, requestUrl } from "obsidian";
import { InsertMode, Orientation, PluginSettings } from "SettingTab";
import { randomImgName } from "utils";
import { PER_PAGE, Image } from "./constants";

const orientationMapping = {
  [Orientation.landscape]: 'horizontal',
  [Orientation.portrait]: 'vertical',
  [Orientation.squarish]: '',
  [Orientation.notSpecified]: '',
}

export const pixabay = (settings: PluginSettings) => {
  const startPage = 1
  let curPage = startPage
  let totalPage = 0

  const { orientation, insertMode, insertSize, imageProvider, pixabayApiKey } = settings

  return {
    imageProvider,
    noResult() { return totalPage <= 0 },
    hasPrevPage() {
      return !this.noResult() && curPage > startPage
    },
    hasNextPage() {
      return !this.noResult() && curPage < totalPage
    },
    prevPage() {
      this.hasPrevPage() && (curPage -= 1)
    },
    nextPage() {
      this.hasNextPage() && (curPage += 1)
    },
    async searchImages(query: string): Promise<Image[]> {
      if (!query || query === "") {
        return []
      }

      const url = new URL("https://pixabay.com/api/")
      url.searchParams.set("key", pixabayApiKey)
      url.searchParams.set("q", query)
      if (orientation != 'not_specified') {
        url.searchParams.set("orientation", orientationMapping[orientation])
      }
      url.searchParams.set("page", `${curPage}`)
      url.searchParams.set("per_page", PER_PAGE)
      const res = await requestUrl({ url: url.toString() })
      const data: Pixabay.RootObject = res.json
      totalPage = data.total / parseInt(PER_PAGE)
      return data.hits.map(function(item) {
        return {
          thumb: item.previewURL,
          url: item.webformatURL,
          pageUrl: item.pageURL,
          userUrl: `https://pixabay.com/users/${item.user}-${item.user_id}`,
          username: item.user,
        }
      })
    },
    async downloadImage(url: string): Promise<ArrayBuffer> {
      const res = await requestUrl({ url })
      return res.arrayBuffer
    },
    async downloadAndInsertImage(image: Image, createFile: (name: string, ext: string, binary: ArrayBuffer) => void): Promise<string> {
      const url = image.url

      const imageSize = insertSize === "" ? "" : `|${insertSize}`
      let nameText = `![${randomImgName()}${imageSize}]`
      let urlText = `(${url})`
      const backlink = settings.insertBackLink && image.pageUrl ? `[Backlink](${image.pageUrl}) | ` : ''
      const referral = `\n*${backlink}Photo by [${image.username}](${image.userUrl}) on [Pixabay](https://pixabay.com/)*\n`

      if (insertMode === InsertMode.local) {
        const imageName = `Inserted image ${moment().format("YYYYMMDDHHmmss")}`
        const ext = "png"
        const arrayBuf = await this.downloadImage(url)
        createFile(imageName, ext, arrayBuf)
        nameText = `![[${imageName}.${ext}${imageSize}]]`
        urlText = ""
      }

      return `${nameText}${urlText}${referral}`
    },
    async downloadAndGetUri(image: Image, createFile: (name: string, ext: string, binary: ArrayBuffer) => void): Promise<{ url: string, referral: string }> {
      const url = image.url
      const backlink = settings.insertBackLink && image.pageUrl ? `[Backlink](${image.pageUrl}) | ` : ''
      const referral = `\n*${backlink}Photo by [${image.username}](${image.userUrl}) on [Pixabay](https://pixabay.com/)*\n`

      if (insertMode === InsertMode.local) {
        const imageName = `Inserted image ${moment().format("YYYYMMDDHHmmss")}`
        const ext = "png"
        const arrayBuf = await this.downloadImage(url)
        createFile(imageName, ext, arrayBuf)
        return { url: `${imageName}.${ext}`, referral }
      }

      return { url, referral }
    }
  }
}
