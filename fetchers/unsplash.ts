import { requestUrl, moment } from "obsidian";
import { InsertMode, PluginSettings } from "SettingTab";
import { randomImgName, validUrl } from "utils";
import { PER_PAGE, Image } from "./constants";

const DEFAULT_PROXY_SERVER = "https://insert-unsplash-image.cloudy9101.com/"
const APP_NAME = encodeURIComponent("Obsidian Image Inserter Plugin")
const UTM = `utm_source=${APP_NAME}&utm_medium=referral`

export const unsplash = (settings: PluginSettings) => {
  const startPage = 1
  let curPage = startPage
  let totalPage = 0

  const { orientation, insertMode, insertSize, imageProvider } = settings

  let proxyServer = DEFAULT_PROXY_SERVER
  if (validUrl(settings.proxyServer)) {
    proxyServer = settings.proxyServer
  }

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

      const url = new URL("/search/photos", proxyServer)
      url.searchParams.set("query", query)
      if (orientation != 'not_specified') {
        url.searchParams.set("orientation", orientation)
      }
      url.searchParams.set("page", `${curPage}`)
      url.searchParams.set("per_page", PER_PAGE)
      const res = await requestUrl({ url: url.toString() })
      const data: Unsplash.RootObject = res.json
      totalPage = data.total_pages
      return data.results.map(function(item) {
        return {
          desc: item.description || item.alt_description,
          thumb: item.urls.thumb,
          url: item.urls.regular,
          downloadLocationUrl: item.links.download_location,
          pageUrl: item.links.html,
          username: item.user.name,
          userUrl: `https://unsplash.com/@${item.user.username}?${UTM}`
        }
      })
    },
    async touchDownloadLocation(url: string): Promise<void> {
      await requestUrl({ url: url.replace("https://api.unsplash.com", proxyServer) })
    },
    async downloadImage(url: string): Promise<ArrayBuffer> {
      const res = await requestUrl({ url })
      return res.arrayBuffer
    },
    async downloadAndInsertImage(image: Image, createFile: (name: string, ext: string, binary: ArrayBuffer) => void): Promise<string> {
      this.touchDownloadLocation(image.downloadLocationUrl)
      const url = image.url

      const imageSize = insertSize === "" ? "" : `|${insertSize}`
      let nameText = `![${image.desc || randomImgName()}${imageSize}]`
      let urlText = `(${url})`
      const backlink = settings.insertBackLink && image.pageUrl ? `[Backlink](${image.pageUrl}) | ` : ''
      const referral = `\n*${backlink}Photo by [${image.username}](${image.userUrl}) on [Unsplash](https://unsplash.com/?${UTM})*\n`

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
      this.touchDownloadLocation(image.downloadLocationUrl)
      const url = image.url
      const backlink = settings.insertBackLink && image.pageUrl ? `[Backlink](${image.pageUrl}) | ` : ''
      const referral = `\n*${backlink}Photo by [${image.username}](${image.userUrl}) on [Unsplash](https://unsplash.com/?${UTM})*\n`

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
