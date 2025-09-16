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

    this.addCommand({
      id: 'insert-random',
      name: 'Insert random image (only support Unsplash)',
      editorCallback: (editor: Editor) => {
        new ModalWrapper(this.app, editor, this.settings, InsertPlace.default, true).open();
      }
    });

    this.addCommand({
      id: 'insert-random-in-frontmatter',
      name: 'Insert random image in frontmatter (only support Unsplash)',
      editorCallback: (editor: Editor) => {
        new ModalWrapper(this.app, editor, this.settings, InsertPlace.frontmatter, true).open();
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
