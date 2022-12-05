import * as React from "react";
import { getFetcher, Image } from 'fetcher'
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Notice } from "obsidian";

import { debounce } from './utils'
import Loading from "./Loading"
import NoResult from "./NoResult"

const ImagesModal = ({ fetcher, onSelect }: { fetcher: ReturnType<typeof getFetcher>, onSelect: (image: Image) => void }) => {
  const [query, setQuery] = useState("")
  const [images, setImages] = useState<Image[]>([])
  const ref = useRef<HTMLDivElement | null>(null)
  const selectedImageRef = useRef<HTMLDivElement | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)

  const [loading, setLoading] = useState(false)

  const fetchImages = async (query: string) => {
    try {
      const images = await fetcher.searchImages(query)
      setImages(images)
      setSelectedImage(0)
    } catch (e) {
      console.error(e)
      new Notice('Something went wrong, please contact the plugin author.')
    }
    setLoading(false)
  }

  const debouncedFetchImages = useCallback(debounce(fetchImages, 1000), [])

  const onQueryChange = useCallback(async (query: string) => {
    setQuery(query)
    debouncedFetchImages(query)
  }, [])

  const onInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true)
    onQueryChange(e.target.value)
  }

  const onPrevBtnClick = () => {
    setLoading(true)
    fetcher.prevPage()
    fetchImages(query)
  }
  const onNextBtnClick = () => {
    setLoading(true)
    fetcher.nextPage()
    fetchImages(query)
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "n") {
      setSelectedImage(prev => prev + 1 >= images.length ? 0 : prev + 1)
    } else if (e.ctrlKey && e.key === "p") {
      setSelectedImage(prev => prev - 1 < 0 ? images.length - 1 : prev - 1)
    } else if (e.key === "Enter") {
      onSelect(images[selectedImage])
    }
  }, [images, selectedImage])

  useEffect(() => {
    const element = ref.current
    if (element) {
      element.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      const element = ref.current
      if (element) {
        element.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [handleKeyDown, ref.current])

  useEffect(() => {
    if (selectedImageRef.current) {
      selectedImageRef.current.scrollIntoView({ block: "nearest" })
    }
  }, [selectedImageRef.current])

  const hasPagination = fetcher.hasPrevPage() || fetcher.hasNextPage()

  return (
    <div ref={ref} className="container">
      <input autoFocus={true} value={query} onChange={onInputChange} className="query-input" />
      {loading && <Loading />}
      {query !== "" && !loading && fetcher.noResult() && <NoResult />}
      <div className={`scroll-area${ loading ? " loading" : "" }`}>
        <div className="images-list">
          {images.map((image, index) => (
            <div
              onClick={() => onSelect(image)}
              onMouseMove={() => setSelectedImage(index)}
              key={image.url}
              className={`query-result${selectedImage === index ? " is-selected" : ""}`}
              ref={index === selectedImage ? selectedImageRef : null}
            >
              <img key={image.url} src={image.url} />
            </div>
          ))}
        </div>
        {hasPagination &&
          <div className="pagination">
            <div>
              {fetcher.hasPrevPage() &&
                <button className="btn"
                  disabled={loading}
                  tabIndex={-1}
                  onClick={onPrevBtnClick}
                >← PREV</button>}
            </div>
            <div>
              {fetcher.hasNextPage() &&
                <button className="btn"
                  disabled={loading}
                  tabIndex={-1}
                  onClick={onNextBtnClick}
                >NEXT →</button>}
            </div>
          </div>
        }
      </div>
    </div>
  )
}

export { ImagesModal }
