import { Editor, Plugin } from 'obsidian';
import { ImagesModal } from 'ImagesModal';

export const APP_NAME = "obsidian-image-inserter"

interface PluginSettings {
	clientId: string;
}

export default class InsertUnsplashImage extends Plugin {
	settings: PluginSettings;

	async onload() {
		this.addCommand({
			id: 'image-inserter-plugin',
			name: 'Insert Unsplash Image',
			editorCallback: (editor: Editor) => {
        new ImagesModal(this.app, editor).open();
			}
		});
	}

	onunload() {}
}
