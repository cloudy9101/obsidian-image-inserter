import { Vault } from "obsidian";
import { PluginSettings } from "SettingTab";
import { PER_PAGE, Image, IMAGE_EXTS } from "./constants";

export const local = (settings: PluginSettings, vault: Vault) => {
  const startPage = 1;
  let curPage = startPage;
  let totalPage = 0;

  const { insertSize, imageSize, imageProvider } = settings;

  return {
    vault,
    imageProvider,
    imageSize,
    noResult() {
      return totalPage <= 0;
    },
    hasPrevPage() {
      return !this.noResult() && curPage > startPage;
    },
    hasNextPage() {
      return !this.noResult() && curPage < totalPage;
    },
    prevPage() {
      this.hasPrevPage() && (curPage -= 1);
    },
    nextPage() {
      this.hasNextPage() && (curPage += 1);
    },
    async searchImages(query: string): Promise<Image[]> {
      const images = vault
        .getFiles()
        .filter(
          (file) =>
            IMAGE_EXTS.includes(file.extension) &&
            file.name.toLowerCase().includes(query.toLowerCase()),
        );
      const perPage = parseInt(PER_PAGE);
      totalPage = Math.ceil(images.length / perPage) + 1;
      return images
        .slice((curPage - 1) * perPage, curPage * perPage)
        .map(function (item) {
          return {
            desc: item.name.replace(new RegExp(/\n/g), " "),
            thumb: vault.getResourcePath(item),
            url: vault.getResourcePath(item),
            pageUrl: "Local",
            username: "Local",
            userUrl: "Local",
          };
        });
    },
    async downloadImage(_: string): Promise<ArrayBuffer> {
      return new ArrayBuffer(0);
    },
    async downloadAndInsertImage(
      image: Image,
      _: (name: string, ext: string, binary: ArrayBuffer) => void,
    ): Promise<string> {
      const url = image.url;

      const imageSize = insertSize === "" ? "" : `|${insertSize}`;
      const nameText = `![${image.desc}${imageSize}]`;
      const urlText = `(${url})`;

      return `${nameText}${urlText}`;
    },
    async downloadAndGetUri(
      image: Image,
      _: (name: string, ext: string, binary: ArrayBuffer) => void,
    ): Promise<{ url: string; referral: string }> {
      this.touchDownloadLocation(image.downloadLocationUrl);
      const url = image.url;

      return { url, referral: "" };
    },
  };
};
