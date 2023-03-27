import { pexels } from './pexels'
import { pixabay } from './pixabay'
import { unsplash } from './unsplash'
import { ImageProvider, PluginSettings } from 'SettingTab'
import { Fetcher } from './constants'

export const getFetcher = (settings: PluginSettings): Fetcher => {
  const { imageProvider } = settings

  switch (imageProvider) {
    case ImageProvider.pexels:
      return pexels(settings);
    case ImageProvider.pixabay:
      return pixabay(settings);
    default:
      return unsplash(settings);
  }
}

