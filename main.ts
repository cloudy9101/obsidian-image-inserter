import { Editor, Plugin } from 'obsidian';

import { SettingTab, PluginSettings, DEFAULT_SETTINGS } from './SettingTab';
import { InsertPlace, ModalWrapper } from './ModalWrapper';

export default class InsertUnsplashImage extends Plugin {
	settings: PluginSettings;

	async onload() {
    this.loadSettings()
    this.addSettingTab(new SettingTab(this.app, this));

		this.addCommand({
			id: 'insert',
			name: 'Insert Image',
			editorCallback: (editor: Editor) => {
        new ModalWrapper(this.app, editor, this.settings).open();
			}
		});

		this.addCommand({
			id: 'insert-in-frontmatter',
			name: 'Insert Image in Frontmatter',
			editorCallback: (editor: Editor) => {
        new ModalWrapper(this.app, editor, this.settings, InsertPlace.frontmatter).open();
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
