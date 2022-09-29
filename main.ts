import { Editor, Plugin } from 'obsidian';

import { ImagesModal } from 'ImagesModal';
import { SettingTab, InsertMode, Orientation } from 'SettingTab';

interface PluginSettings {
  insertMode: InsertMode
  orientation: Orientation
}

const DEFAULT_SETTINGS = {
  insertMode: InsertMode.remote,
  orientation: Orientation.landscape,
}

export default class InsertUnsplashImage extends Plugin {
	settings: PluginSettings;

	async onload() {
    this.loadSettings()
    this.addSettingTab(new SettingTab(this.app, this));

		this.addCommand({
			id: 'insert',
			name: 'Insert Unsplash Image',
			editorCallback: (editor: Editor) => {
        new ImagesModal(this.app, editor, this.settings).open();
			}
		});
	}

	onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
