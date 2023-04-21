import { requestUrl, moment } from "obsidian";
import { ImageQuality, InsertMode, Orientation, PluginSettings } from "SettingTab";
import { randomImgName } from "utils";
import { PER_PAGE, Image } from "./constants";

const orientationMapping = {
  [Orientation.landscape]: 'landscape',
  [Orientation.portrait]: 'portrait',
  [Orientation.squarish]: 'square',
  [Orientation.notSpecified]: '',
}

const imageQualityMapping: Record<ImageQuality, keyof Pexels.Src> = {
  [ImageQuality.raw]: 'original',
  [ImageQuality.high]: 'large',
  [ImageQuality.medium]: 'medium',
  [ImageQuality.low]: 'small',
}

export const pexels = (settings: PluginSettings) => {
  const startPage = 1
  let curPage = startPage
  let totalPage = 0

  const { orientation, insertMode, insertSize, imageQuality, imageProvider, pexelsApiKey, useMarkdownLinks } = settings

  return {
    imageProvider,
    imageQuality,
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

      const url = new URL("https://api.pexels.com/v1/search")
      url.searchParams.set("query", query)
      if (orientation != 'not_specified') {
        url.searchParams.set("orientation", orientationMapping[orientation])
      }
      url.searchParams.set("page", `${curPage}`)
      url.searchParams.set("per_page", PER_PAGE)
      const res = await requestUrl({
        url: url.toString(),
        headers: { Authorization: pexelsApiKey },
      })
      const data: Pexels.RootObject = res.json
      totalPage = data.total_results / parseInt(PER_PAGE)
      return data.photos.map(function(item) {
        return {
          thumb: item.src.small,
          url: item.src[imageQualityMapping[imageQuality]],
          pageUrl: item.url,
          userUrl: item.photographer_url,
          username: item.photographer,
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
      const referral = `\n*${backlink}Photo by [${image.username}](${image.userUrl}) on [Pexels](https://pexels.com/)*\n`

      if (insertMode === InsertMode.local) {
        const imageName = `Inserted image ${moment().format("YYYYMMDDHHmmss")}`
        const ext = "png"
        const arrayBuf = await this.downloadImage(url)
        createFile(imageName, ext, arrayBuf)
        nameText = useMarkdownLinks ? `![${insertSize}](${encodeURIComponent(imageName)}.${ext})` : `![[${imageName}.${ext}${imageSize}]]`
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
