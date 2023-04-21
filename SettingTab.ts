import InsertUpsplashImagePlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";
import { providerMapping } from "fetchers/constants";

export enum InsertMode {
  remote = 'remote',
  local = 'local',
}

export enum Orientation {
  notSpecified = 'not_specified',
  landscape = 'landscape',
  portrait = 'portrait',
  squarish = 'squarish',
}

export enum ImageProvider {
  unsplash = 'unsplash',
  pixabay = 'pixabay',
  pexels = 'pexels',
}

export enum ImageQuality {
  raw = 'raw',
  high = 'high',
  medium = 'medium',
  low = 'low',
}

export interface PluginSettings {
  insertMode: InsertMode
  orientation: Orientation
  insertSize: string
  imageQuality: ImageQuality
  frontmatter: {
    key: string
    valueFormat: string
    appendReferral: boolean
  }
  imageProvider: ImageProvider
  proxyServer: string
  pixabayApiKey: string
  insertBackLink: boolean
  pexelsApiKey: string
  useMarkdownLinks: boolean
}

export const DEFAULT_SETTINGS = {
  insertMode: InsertMode.remote,
  orientation: Orientation.landscape,
  insertSize: "",
  imageQuality: ImageQuality.high,
  frontmatter: {
    key: "image",
    valueFormat: "{image-url}",
    appendReferral: false
  },
  imageProvider: ImageProvider.unsplash,
  proxyServer: "",
  pixabayApiKey: "",
  insertBackLink: false,
  pexelsApiKey: "",
}

export class SettingTab extends PluginSettingTab {
  plugin: InsertUpsplashImagePlugin;

  constructor(app: App, plugin: InsertUpsplashImagePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Insert Mode")
      .setDesc("Should the image be insert remotely(with Unsplash url) or locally(download into attachments folder).")
      .addDropdown((dropdown) =>
        dropdown
          .addOption(InsertMode.remote, 'Remote')
          .addOption(InsertMode.local, 'Local')
          .setValue(this.plugin.settings.insertMode)
          .onChange(async (value) => {
            if (value === InsertMode.remote || value === InsertMode.local) {
              this.plugin.settings.insertMode = value;
              await this.plugin.saveSettings();
            }
          })
      );

    new Setting(containerEl)
      .setName("Orientation")
      .setDesc("Search images with the specified orientation.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption(Orientation.notSpecified, 'Not Specified')
          .addOption(Orientation.landscape, 'Landscape')
          .addOption(Orientation.portrait, 'Portrait')
          .addOption(Orientation.squarish, 'Squarish')
          .setValue(this.plugin.settings.orientation)
          .onChange(async (value) => {
            if (value === Orientation.notSpecified ||
                value === Orientation.landscape ||
                value === Orientation.portrait ||
                value === Orientation.squarish) {
              this.plugin.settings.orientation = value;
              await this.plugin.saveSettings();
            }
          })
      );

    new Setting(containerEl)
      .setName("Insert Size")
      .setDesc("Set the size of the image when inserting. Format could be only width \"200\" or width and height \"200x100\".")
      .addText((text) => {
        text
          .setValue(this.plugin.settings.insertSize)
          .onChange(async (value) => {
            this.plugin.settings.insertSize = value
            await this.plugin.saveSettings()
        })
      })

    new Setting(containerEl)
      .setName("Default Image Quality")
      .setDesc("Set the default preferred image quality from image providers")
      .addDropdown((dropdown) => {
        dropdown.addOptions({
          [ImageQuality.raw]: ImageQuality.raw,
          [ImageQuality.high]: ImageQuality.high,
          [ImageQuality.medium]: ImageQuality.medium,
          [ImageQuality.low]: ImageQuality.low,
        })
        .setValue(this.plugin.settings.imageQuality)
        .onChange(async (value: ImageQuality) => {
          this.plugin.settings.imageQuality = value
          await this.plugin.saveSettings()
        })
      })

    new Setting(containerEl)
      .setName("Insert backlink")
      .setDesc("Insert a backlink(image HTML location on Provider website) in front of the reference text, eg. Backlink | Photo by ...")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.insertBackLink)
        .onChange(async (value: boolean) => {
          this.plugin.settings.insertBackLink = value
          await this.plugin.saveSettings()
        })
      })

    containerEl.createEl("h1", { text: "Frontmatter" })
    new Setting(containerEl)
      .setName("Insert to Frontmatter Key")
      .setDesc("The key used when insert to frontmatter.")
      .addText((text) => {
        text
          .setPlaceholder("image")
          .setValue(this.plugin.settings.frontmatter.key)
          .onChange(async (value) => {
            this.plugin.settings.frontmatter.key = value
            await this.plugin.saveSettings()
        })
      })

    new Setting(containerEl)
      .setName("Insert to Frontmatter Value Format")
      .setDesc("The value format used when insert to frontmatter. {image-url} will be replaced by the image url. Please visit https://github.com/cloudy9101/obsidian-image-inserter#frontmatter-value-format for more details.")
      .addText((text) => {
        text
          .setPlaceholder("{image-url}")
          .setValue(this.plugin.settings.frontmatter.valueFormat)
          .onChange(async (value) => {
            this.plugin.settings.frontmatter.valueFormat = value
            await this.plugin.saveSettings()
        })
      })

    new Setting(containerEl)
      .setName("Append image referral at end of the file")
      .setDesc("Will append image referral at end of the file if set to true")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.frontmatter.appendReferral)
          .onChange(async (value) => {
            this.plugin.settings.frontmatter.appendReferral = value
            await this.plugin.saveSettings()
        })
      })

    containerEl.createEl("h1", { text: "Image Provider" })
    new Setting(containerEl)
      .setName("Default Provider")
      .addDropdown((dropdown) => {
        dropdown.addOptions({
          [ImageProvider.unsplash]: providerMapping[ImageProvider.unsplash],
          [ImageProvider.pixabay]: providerMapping[ImageProvider.pixabay],
          [ImageProvider.pexels]: providerMapping[ImageProvider.pexels],
        })
        .setValue(this.plugin.settings.imageProvider)
        .onChange(async (value: ImageProvider) => {
          this.plugin.settings.imageProvider = value
          await this.plugin.saveSettings()
        })
      })

    new Setting(containerEl)
      .setName("Unsplash Proxy Server")
      .setDesc("Use a self host proxy server. Leave it empty if you don't want host proxy server by yourself.")
      .addText((text) => {
        text
          .setPlaceholder("https://self-host-proxy.com/")
          .setValue(this.plugin.settings.proxyServer)
          .onChange(async (value) => {
            this.plugin.settings.proxyServer = value
            await this.plugin.saveSettings()
        })
      })

    new Setting(containerEl)
      .setName("Pixabay API key")
      .setDesc("API key can be found on https://pixabay.com/api/docs/ after logging in.")
      .addText((text) => {
        text
          .setPlaceholder("Your API key")
          .setValue(this.plugin.settings.pixabayApiKey)
          .onChange(async (value) => {
            this.plugin.settings.pixabayApiKey = value
            await this.plugin.saveSettings()
        })
      })

    new Setting(containerEl)
      .setName("Pexels API key")
      .setDesc("API key can be created on https://www.pexels.com/api/new/ after logging in.")
      .addText((text) => {
        text
          .setPlaceholder("Your API key")
          .setValue(this.plugin.settings.pexelsApiKey)
          .onChange(async (value) => {
            this.plugin.settings.pexelsApiKey = value
            await this.plugin.saveSettings()
        })
      })
  }
}
