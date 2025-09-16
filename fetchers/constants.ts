import { Vault } from "obsidian";
import { ImageProvider, ImageSize } from "SettingTab";

export const APP_NAME = encodeURIComponent("Obsidian Image Inserter Plugin");
export const UTM = `utm_source=${APP_NAME}&utm_medium=referral`;
export const PER_PAGE = "30";

export const providerMapping = {
  [ImageProvider.unsplash]: "Unsplash",
  [ImageProvider.pixabay]: "Pixabay",
  [ImageProvider.pexels]: "Pexels",
  [ImageProvider.local]: "Local",
};

export const imageProviders = [
  ImageProvider.unsplash,
  ImageProvider.pixabay,
  ImageProvider.pexels,
  ImageProvider.local,
];

export const imageSizes = [
  ImageSize.raw,
  ImageSize.large,
  ImageSize.medium,
  ImageSize.small,
];

export const imageSizesMapping = {
  [ImageSize.raw]: "Raw",
  [ImageSize.large]: "Large",
  [ImageSize.medium]: "Medium",
  [ImageSize.small]: "Small",
};

export interface Image {
  desc?: string;
  thumb: string;
  url: string;
  downloadLocationUrl?: string;
  pageUrl: string;
  username: string;
  userUrl: string;
}

export interface Fetcher {
  vault: Vault;
  imageProvider: ImageProvider;
  imageSize: ImageSize;
  noResult: () => boolean;
  hasPrevPage: () => boolean;
  hasNextPage: () => boolean;
  prevPage: () => void;
  nextPage: () => void;
  searchImages: (query: string) => Promise<Image[]>;
  randomImage: (query: string) => Promise<Image[]>;
  touchDownloadLocation?: (url: string) => Promise<void>;
  downloadImage: (url: string) => Promise<ArrayBuffer>;
  downloadAndInsertImage: (
    image: Image,
    createFile: (name: string, ext: string, binary: ArrayBuffer) => void,
  ) => Promise<string>;
  downloadAndGetUri: (
    image: Image,
    createFile: (name: string, ext: string, binary: ArrayBuffer) => void,
  ) => Promise<{ url: string; referral: string }>;
}

export const IMAGE_EXTS = [
  "avif",
  "bmp",
  "gif",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "webp",
];
