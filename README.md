# Obsidian Image Inserter

This plugin helps users easily search and insert images to editors from [Unsplash](https://unsplash.com).
*Unsplash provides over 3 million free high-resolution images.*

# Usage

[demo.webm](https://user-images.githubusercontent.com/5436425/187962730-8d689c39-cec8-40f5-87af-be00d67d2243.webm)

When editing a note and want to insert an image from Unsplash:
1. Open command palette (⌘+P / Ctrl+P).
2. Search the command "Image Inserter: Insert Unsplash Image".
3. Click on the command, then a modal opened.
4. Input some words describe image you'd like to insert, e.g. robot.
5. Wait a second, there will show several images from Unsplash.
6. Click an image you'd like to insert.
7. The image should be inserted into your note now.

Tip: You can also set a hotkey for the "Image Inserter: Insert Unsplash Image" command which allows you activate the command without open command palette and search it. [Custom hotkeys](https://help.obsidian.md/Customization/Custom+hotkeys)

# Installation

### Manually installing the plugin

Copy over main.js, styles.css, manifest.json to your vault VaultFolder/.obsidian/plugins/insert-unsplash-image/.

### From the Community Plugins list
Search for "Image Inserter" in Obsidian's community plugins browser.
Enable the plugin in your Obsidian settings (find "Image Inserter" under "Community plugins").

# Notes

Between your editor and Unsplash API, there is an HTTP proxy that runs on my own server. This means all your search input will send to my own server first. Please don't use this plugin if you can't accept it.
The proxy server is necessary because Unsplash API requires a client ID when fetching data from it and Unsplash requires the developer to keep it secret.

# Development

Clone the repository, run `npm install` to install the dependencies, and run `npm run dev` to compile the plugin and watch file changes.

See https://github.com/obsidianmd/obsidian-api for Obsidian's API documentation.

Issues and PRs welcome.

# License

This plugin's code and documentation is released under the [MIT License](./LICENSE).
