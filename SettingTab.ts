import InsertUpsplashImagePlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

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
}

export interface PluginSettings {
  insertMode: InsertMode
  orientation: Orientation
  insertSize: string
  frontmatter: {
    key: string
    valueFormat: string
  }
  imageProvider: ImageProvider
  proxyServer: string
  pixabayApiKey: string
}

export const DEFAULT_SETTINGS = {
  insertMode: InsertMode.remote,
  orientation: Orientation.landscape,
  insertSize: "",
  frontmatter: {
    key: "image",
    valueFormat: "{image-url}"
  },
  imageProvider: ImageProvider.unsplash,
  proxyServer: "",
  pixabayApiKey: "",
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
      .setName("Image Provider")
      .addDropdown((dropdown) => {
        dropdown.addOptions({
          [ImageProvider.unsplash]: 'Unsplash',
          [ImageProvider.pixabay]: 'Pixabay',
        })
        .setValue(this.plugin.settings.imageProvider)
        .onChange(async (value: ImageProvider) => {
          this.plugin.settings.imageProvider = value
          await this.plugin.saveSettings()
        })
      })

    containerEl.createEl("h2", { text: "Unsplash" })
    new Setting(containerEl)
      .setName("Proxy Server")
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

    containerEl.createEl("h2", { text: "Pixabay" })
    new Setting(containerEl)
      .setName("API key")
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
  }
}
