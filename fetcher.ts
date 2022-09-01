export interface Image {
  desc: string
  thumb: string
  url: string
  author: {
    name: string
    username: string
  }
}

export function getFetcher() {
  return {
    async searchImages(query: string): Promise<Image[]> {
      const url = new URL("/search/photos", "https://insert-unsplash-image.cloudy9101.com/")
      url.searchParams.set("query", query)
      url.searchParams.set("orientation", "landscape")
      url.searchParams.set("per_page", "9")
      const res = await fetch(url)
      const data: Unsplash.RootObject = await res.json()
      return data.results.map(function(item) {
        return {
          desc: item.description || item.alt_description,
          thumb: item.urls.thumb,
          url: item.urls.regular,
          author: {
            name: item.user.name,
            username: item.user.username,
          },
        }
      })
    }
  }
}
