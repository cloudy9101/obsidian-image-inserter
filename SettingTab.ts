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

export interface PluginSettings {
  insertMode: InsertMode
  orientation: Orientation
  insertSize: string
}

export const DEFAULT_SETTINGS = {
  insertMode: InsertMode.remote,
  orientation: Orientation.landscape,
  insertSize: "",
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

    // new Setting(containerEl)
    //   .setName("Insert Mode")
    //   .setDesc("Should the image be insert remotely(with Unsplash url) or locally(download into attachments folder).")
    //   .addDropdown((dropdown) =>
    //     dropdown
    //       .addOption(InsertMode.remote, 'Remote')
    //       .addOption(InsertMode.local, 'Local')
    //       .setValue(this.plugin.settings.insertMode)
    //       .onChange(async (value) => {
    //         if (value === InsertMode.remote || value === InsertMode.local) {
    //           this.plugin.settings.insertMode = value;
    //           await this.plugin.saveSettings();
    //         }
    //       })
    //   );

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
  }
}
