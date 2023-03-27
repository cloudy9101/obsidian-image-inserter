# Obsidian Image Inserter

This plugin helps users easily search and insert images to editors from one or more image sources.

# Features

- Search images from Unsplash / Pixabay / Pexels (Will support more sources in the future)
- Insert image locally (download it into your resource folder), or remotely (only insert the image url)
- Set default image size, support only width or width and height
- Set preferred image orientation when searching
- Insert image to frontmatter with customized key and value format

# Support Image Sources

- [Unsplash](https://unsplash.com) Unsplash provides over 3 million free high-resolution images.
- [Pixabay](https://pixabay.com) Over 2.8 million+ high quality stock images, videos and music shared by our talented community.
- [Pexels](https://pexels.com) The best free stock photos, royalty free images & videos shared by creators.

# Usage

### Insert image to current place

[demo.webm](https://user-images.githubusercontent.com/5436425/194984473-506249c2-b3ed-4c3d-835b-494f43c7684a.webm)

When editing a note and want to insert an image from Unsplash:
1. Open command palette (⌘+P / Ctrl+P).
2. Search the command "Image Inserter: Insert Image".
3. Click on the command, then a modal opened.
4. Input some words describe image you'd like to insert, e.g. robot.
5. Wait a second, there will show several images from Unsplash / Pixabay / Pexels.
6. Click an image you'd like to insert.
7. The image should be inserted into your note now.

### Insert image to frontmatter

About [front matter](https://help.obsidian.md/Advanced+topics/YAML+front+matter).
Some plugins or markdown driven site generators read from front matter as metadata and maybe extract the header image or cover image from the metadata.
Our insert image to frontmatter feature should be useful in those cases.

If you want to insert an image to frontmatter:
1. Set the frontmatter key and value format in the plugin setting tab.
2. Open a markdown file you want to edit
3. Open command palette (⌘+P / Ctrl+P).
4. Search the command "Image Inserter: Insert Image in Frontmatter" and click.
5. Search and click an image you want to insert in the opened modal.
6. The image URL should be inserted into your file's frontmatter with the set key and value format.

# Tip

You can also set a hotkey for the "Image Inserter: Insert Image" and "Image Inserter: Insert Image in Frontmatter" command which allows you activate the command without open command palette and search it. [Custom hotkeys](https://help.obsidian.md/Customization/Custom+hotkeys)

## Key Bindings

In the image searching modal, there's several convience shortcut key bindings.
`Ctrl + n` -> select next image
`Ctrl + p` -> select previous image
`Ctrl + u` -> switch image provider

# Installation

### From the Community Plugins list (Recommend)

Search for "Image Inserter" in Obsidian's community plugins browser.
Enable the plugin in your Obsidian settings (find "Image Inserter" under "Community plugins").

### Manually installing the plugin

Copy over main.js, styles.css, manifest.json to your vault VaultFolder/.obsidian/plugins/insert-unsplash-image/.

# Notes

### Unsplash API Proxy

Between your editor and Unsplash API, there is an HTTP proxy that runs on my own server. This means all your search input will send to my own server first. Please don't use this plugin if you can't accept it.
The proxy server is necessary because Unsplash API requires a client ID when fetching data from it and Unsplash requires the developer to keep it secret.

#### Self host proxy

If you want to host the proxy server by yourself, please refer to the [proxy repo](https://github.com/cloudy9101/obsidian-image-inserter-proxy).
After setup the proxy server, you can set the proxy server address on the plugin's settings tab.

### Frontmatter value format

You can set a customized value format for inserting in frontmatter.
The default format will be "{image-url}".
```
# if the key is "image" and the value format is "{image-url}", it will be
---
image: "https://some-random-image-url.com"
---

# if the key is "banner" and the value format is "![[{image-url}]], it will be
---
banner: "![[https://some-random-image-url.com]]"
---
```

# Development

Clone the repository, run `npm install` to install the dependencies, and run `npm run dev` to compile the plugin and watch file changes.

See https://github.com/obsidianmd/obsidian-api for Obsidian's API documentation.

Issues and PRs welcome.

# Thanks 

[@javiavid](https://github.com/javiavid)

[@vovech](https://github.com/vovech)

# License

This plugin's code and documentation is released under the [MIT License](./LICENSE).
