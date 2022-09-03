export interface Image {
  desc: string
  thumb: string
  url: string
  downloadLocationUrl: string
  author: {
    name: string
    username: string
  }
}

export function getFetcher() {
  return {
    async searchImages(query: string, orientation: string): Promise<Image[]> {
      const url = new URL("/search/photos", "https://insert-unsplash-image.cloudy9101.com/")
      url.searchParams.set("query", query)
      url.searchParams.set("orientation", orientation)
      url.searchParams.set("per_page", "9")
      const res = await fetch(url)
      const data: Unsplash.RootObject = await res.json()
      return data.results.map(function(item) {
        return {
          desc: item.description || item.alt_description,
          thumb: item.urls.thumb,
          url: item.urls.regular,
          downloadLocationUrl: item.links.download_location,
          author: {
            name: item.user.name,
            username: item.user.username,
          },
        }
      })
    },
    async touchDownloadLocation(url: string): Promise<void> {
      await fetch(url.replace("api.unsplash.com", "insert-unsplash-image.cloudy9101.com"))
    }
  }
}
