import { Editor, Plugin } from 'obsidian';

import { SettingTab, PluginSettings, DEFAULT_SETTINGS } from './SettingTab';
import { ModalWrapper } from './ModalWrapper';

export default class InsertUnsplashImage extends Plugin {
	settings: PluginSettings;

	async onload() {
    this.loadSettings()
    this.addSettingTab(new SettingTab(this.app, this));

		this.addCommand({
			id: 'insert',
			name: 'Insert Unsplash Image',
			editorCallback: (editor: Editor) => {
        new ModalWrapper(this.app, editor, this.settings).open();
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
