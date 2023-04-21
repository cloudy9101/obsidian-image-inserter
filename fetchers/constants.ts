import { ImageProvider, ImageQuality } from "SettingTab"

export const APP_NAME = encodeURIComponent("Obsidian Image Inserter Plugin")
export const UTM = `utm_source=${APP_NAME}&utm_medium=referral`
export const PER_PAGE = "30"

export const providerMapping = {
  [ImageProvider.unsplash]: 'Unsplash',
  [ImageProvider.pixabay]: 'Pixabay',
  [ImageProvider.pexels]: 'Pexels',
}

export const imageProviders = [
  ImageProvider.unsplash,
  ImageProvider.pixabay,
  ImageProvider.pexels,
]

export const imageQualities = [
  ImageQuality.raw,
  ImageQuality.high,
  ImageQuality.medium,
  ImageQuality.low,
]

export interface Image {
  desc?: string
  thumb: string
  url: string
  downloadLocationUrl?: string
  pageUrl: string
  username: string
  userUrl: string
}

export interface Fetcher {
  imageProvider: ImageProvider,
  imageQuality: ImageQuality,
  noResult: () => boolean,
  hasPrevPage: () => boolean,
  hasNextPage: () => boolean,
  prevPage: () => void,
  nextPage: () => void,
  searchImages: (query: string) => Promise<Image[]>,
  touchDownloadLocation?: (url: string) => Promise<void>
  downloadImage: (url: string) => Promise<ArrayBuffer>,
  downloadAndInsertImage: (image: Image, createFile: (name: string, ext: string, binary: ArrayBuffer) => void) => Promise<string>,
  downloadAndGetUri: (image: Image, createFile: (name: string, ext: string, binary: ArrayBuffer) => void) => Promise<{ url: string, referral: string }>,
}

