import * as React from "react";
import { getFetcher } from 'fetchers'
import { Fetcher, Image, imageProviders, imageQualities, providerMapping } from 'fetchers/constants'
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Notice } from "obsidian";

import { debounce } from './utils'
import Loading from "./Loading"
import NoResult from "./NoResult"
import { ImageProvider, ImageQuality, PluginSettings } from "SettingTab";

interface Props {
  fetcher: Fetcher,
  onFetcherChange: (fetcher: Fetcher) => void,
  settings: PluginSettings,
  onSelect: (image: Image) => void
}

const ImagesModal = ({ fetcher: defaultFetcher, onFetcherChange, settings, onSelect }: Props) => {
  const [fetcher, setFetcher] = useState(defaultFetcher)
  const [query, setQuery] = useState("")
  const [images, setImages] = useState<Image[]>([])
  const ref = useRef<HTMLDivElement | null>(null)
  const selectedImageRef = useRef<HTMLDivElement | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [error, setError] = useState()

  const [loading, setLoading] = useState(false)

  const fetchImages = async (query: string) => {
    try {
      const images = await fetcher.searchImages(query)
      setImages(images)
      setSelectedImage(0)
    } catch (e) {
      setError(e.message)
      console.error(e)
      new Notice('Something went wrong, please contact the plugin author.')
    }
    setLoading(false)
  }

  const debouncedFetchImages = useCallback(debounce(fetchImages, 1000), [fetcher])

  const onQueryChange = async (query: string) => {
    setQuery(query)
    debouncedFetchImages(query)
  }

  const onInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true)
    setError(undefined)
    onQueryChange(e.target.value)
  }

  const onProviderChange = async (provider: ImageProvider) => {
    setLoading(true)
    setError(undefined)
    const newFetcher = getFetcher({...settings, imageProvider: provider, imageQuality: fetcher.imageQuality})
    setFetcher(newFetcher)
    onFetcherChange(newFetcher)
  }

  const onProviderSelectorChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const provider = e.target.value as ImageProvider
    await onProviderChange(provider)
  }

  const onImageQualityChange = async (quality: ImageQuality) => {
    setLoading(true)
    setError(undefined)
    const newFetcher = getFetcher({...settings, imageQuality: quality, imageProvider: fetcher.imageProvider})
    setFetcher(newFetcher)
    onFetcherChange(newFetcher)
  }

  const onImageQualitySelectorChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const quality = e.target.value as ImageQuality
    await onImageQualityChange(quality)
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
    } else if (e.ctrlKey && e.key === "u") {
      let index = imageProviders.indexOf(fetcher.imageProvider) + 1
      if (index >= imageProviders.length) {
        index = 0
      }
      onProviderChange(imageProviders[index])
    } else if (e.ctrlKey && e.key === "i") {
      let index = imageQualities.indexOf(fetcher.imageQuality) + 1
      if (index >= imageQualities.length) {
        index = 0
      }
      onImageQualityChange(imageQualities[index])
    } else if (e.key === "Enter") {
      e.preventDefault()
      onSelect(images[selectedImage])
    }
  }, [images, selectedImage, fetcher.imageProvider])

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

  useEffect(() => {
    if (fetcher) {
      onQueryChange(query)
    }
  }, [fetcher])

  const hasPagination = fetcher.hasPrevPage() || fetcher.hasNextPage()

  return (
    <div ref={ref} className="container">
      <div className="input-group">
        <input autoFocus={true} value={query} onChange={onInputChange} className="query-input" />
        <select value={fetcher.imageProvider} onChange={onProviderSelectorChange} className="selector">
          {imageProviders.map((provider) => (
            <option key={provider} value={provider}>{providerMapping[provider]}</option>
          ))}
        </select>
        <select value={fetcher.imageQuality} onChange={onImageQualitySelectorChange} className="selector">
          {imageQualities.map((quality) => (
            <option key={quality} value={quality}>{quality}</option>
          ))}
        </select>
      </div>
      {loading && <Loading />}
      {query !== "" && !loading && fetcher.noResult() && <NoResult />}
      {error}
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
              <img key={image.url} src={image.thumb} />
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
        {fetcher.imageProvider === ImageProvider.pixabay &&
          <div className="pixabay-logo">
            <a href="https://pixabay.com/" target="_blank">
              <svg xmlns="http://www.w3.org/2000/svg" height="100" width="100" version="1.1" viewBox="0 0 500 500">
                <g transform="translate(-507.42999,175.07001)">
                  <rect height="500" width="500" y="-175.07" x="507.43" fill="#222"/>
                  <g fill="#FFF" transform="matrix(2.7777778,0,0,2.7777778,-2096.4989,0.29221019)">
                    <path d="m993.33-7.7954c-2.671,0-4.8365-2.1665-4.8365-4.8392h-16.569c0,2.6727-2.1651,4.8392-4.8363,4.8392h-4.4254v51.484h84.798v-51.483h-54.065zm-4.83,15.24h-16.571v-7.2076h16.569v7.2076zm29.124,28.522c-9.8169,0-17.804-7.9906-17.804-17.813,0-9.8226,7.987-17.402,17.804-17.402,9.8171,0,17.804,7.5795,17.804,17.402,0,9.8226-7.9865,17.813-17.804,17.813zm9.571-17.813c0,5.28-4.2937,9.576-9.5707,9.576-5.2772,0-9.5708-4.2963-9.5708-9.576,0-5.2806,4.2936-9.576,9.5708-9.576,5.277,0,9.5707,4.2957,9.5707,9.576zm66.262-29.941-21.421,55.346-17.241-6.6808v-9.4327l12.218,4.7345,15.073-38.942-56.483-21.887-5.2351,13.525h-9.426l9.6383-24.901,72.876,28.239z"/>
                    <g fontFamily="VomZom" fontSize="27.43096924px" line-height="125%" fontStretch="normal" fontVariant="normal" fontWeight="normal" fontStyle="normal">
                      <path d="m972.14,64.921c-2.7039,0.06735-4.9506,0.99582-6.7402,2.7854s-2.7181,4.0364-2.7854,6.7402v17.223h3.7847v-7.6545h5.7409c2.7056-0.0691,4.9595-1.0047,6.7615-2.8067s2.7375-4.0558,2.8067-6.7615c-0.0691-2.7039-1.0047-4.9506-2.8067-6.7402s-4.0558-2.718-6.7615-2.7854zm-5.7409,15.309,0-5.7834c0.0399-1.6346,0.59801-2.99,1.6744-4.0665,1.0764-1.0764,2.4319-1.6345,4.0665-1.6744,1.6549,0.03988,3.0228,0.59802,4.1037,1.6744,1.0808,1.0764,1.6407,2.4319,1.6797,4.0665-0.039,1.6549-0.59891,3.0228-1.6797,4.1037-1.0809,1.0809-2.4488,1.6408-4.1037,1.6797z"/>
                      <path d="m984.13,83.93,3.7422,0,0-19.094-3.7422,0z"/>
                      <path d="m1004.9,83.973-4.9073-6.2277-4.4076,6.2277-5.282,0,7.3341-9.7788-6.7452-9.3327,5.1214,0,4.0329,5.8352,4.4968-5.8352,5.0857,0-7.3341,9.3327,8.0122,9.7788z"/>
                      <path d="m1020,64.836c-2.78,0.01392-5.5411,1.2356-7.3217,3.389-2.5173,2.889-2.9277,7.3319-1.1016,10.68,1.503,2.8167,4.4818,4.7722,7.6742,4.9822,2.0115,0.08973,4.028,0.02048,6.0416,0.04228h4.2331c-0.01-3.315,0.02-6.6309-0.015-9.9454-0.098-2.8431-1.5228-5.5984-3.8252-7.2788-1.6236-1.2335-3.6602-1.8331-5.6853-1.8696zm0,15.309c-2.4155,0.03477-4.7585-1.5866-5.4781-3.9086-0.8301-2.3925,0.086-5.2767,2.2388-6.6514,2.3653-1.6093,5.9042-1.1463,7.6851,1.1269,1.09,1.2527,1.3722,2.9584,1.2951,4.5678v4.865h-5.7z"/>
                      <path d="m1035.6,64.921v-7.6545h-3.7848c0.01,5.8108-0.012,11.622,0.01,17.432,0.054,3.9898,2.8702,7.7511,6.7059,8.8726,3.6906,1.1933,8.0347-0.12452,10.369-3.2412,2.8592-3.5647,2.6169-9.1977-0.6105-12.455-1.9534-2.1419-4.9109-3.0977-7.76-2.9545h-4.9289zm5.7834,15.309c-2.6131,0.04941-5.1132-1.8749-5.6269-4.4552-0.2827-1.5643-0.1078-3.1645-0.1565-4.7461v-2.323c2.1274,0.02223,4.2582-0.04689,6.3833,0.03925,2.6883,0.20268,4.9782,2.5587,5.1161,5.2493,0.2744,2.6972-1.6024,5.4384-4.2654,6.0466-0.4742,0.1185-0.9623,0.1776-1.4506,0.18916z"/>
                      <path d="m1062.7,64.836c-2.7799,0.01394-5.5411,1.2356-7.3217,3.389-2.5172,2.889-2.9276,7.3319-1.1015,10.68,1.5029,2.8167,4.4818,4.7722,7.6742,4.9822,2.0115,0.08973,4.0279,0.02048,6.0415,0.04228h4.2332c-0.01-3.315,0.02-6.6309-0.015-9.9454-0.098-2.8431-1.5228-5.5984-3.8252-7.2788-1.6236-1.2335-3.6602-1.8331-5.6854-1.8696zm0,15.309c-2.4155,0.03475-4.7585-1.5866-5.478-3.9086-0.8301-2.3925,0.086-5.2767,2.2388-6.6514,2.3653-1.6093,5.9042-1.1463,7.6851,1.1269,1.09,1.2527,1.3721,2.9584,1.295,4.5678v4.865h-5.7z"/>
                      <path d="m1089.9,64.879c-0.016,3.3276,0.032,6.6571-0.025,9.9835-0.1308,2.7-2.413,5.0836-5.1161,5.2865-2.7002,0.34612-5.4922-1.4815-6.1585-4.1395-0.3846-1.5788-0.1677-3.2172-0.2248-4.8256v-6.305h-3.7848c0.014,3.3424-0.029,6.6862,0.023,10.028,0.1465,4.1428,3.3074,7.9466,7.3694,8.8022,2.7164,0.66144,5.7202,0.05068,7.9166-1.6922,0.066,2.6174-1.8415,5.1442-4.428,5.6694-1.0594,0.24194-2.1504,0.13118-3.2266,0.15651v3.7847c2.1224,0.04087,4.3304-0.0016,6.2465-1.0395,3.2212-1.6055,5.2812-5.14,5.1928-8.7259v-16.983c-1.2616,0.000002-2.5231,0.000003-3.7847,0.000005z"/>
                    </g>
                  </g>
                </g>
              </svg>
            </a>
          </div>
        }
      </div>
    </div>
  )
}

export { ImagesModal }
