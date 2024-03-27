import { pexels } from "./pexels";
import { pixabay } from "./pixabay";
import { unsplash } from "./unsplash";
import { ImageProvider, PluginSettings } from "SettingTab";
import { Fetcher } from "./constants";
import { Vault } from "obsidian";
import { local } from "./local";

export const getFetcher = (settings: PluginSettings, vault: Vault): Fetcher => {
  const { imageProvider } = settings;

  switch (imageProvider) {
    case ImageProvider.local:
      return local(settings, vault);
    case ImageProvider.pexels:
      return pexels(settings, vault);
    case ImageProvider.pixabay:
      return pixabay(settings, vault);
    default:
      return unsplash(settings, vault);
  }
};
