import { useNitroApp } from '#imports'

export interface MediaMetadata {
    title: string
    imageUrl: string
}

export async function extractMetadataFromUrl(url: string): Promise<MediaMetadata> {
    const logger = useNitroApp().logger

    // Handle YouTube URLs
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    if (youtubeMatch) {
        const videoId = youtubeMatch[1]
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

        // Try to get title from YouTube oEmbed API
        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
            const oembedResponse = await fetch(oembedUrl)
            if (oembedResponse.ok) {
                const oembedData = await oembedResponse.json()
                return {
                    title: oembedData.title || 'YouTube Video',
                    imageUrl: thumbnailUrl
                }
            }
        } catch (error) {
            logger.warn('Failed to fetch YouTube oEmbed data:', error)
        }

        return {
            title: 'YouTube Video',
            imageUrl: thumbnailUrl
        }
    }

    // Fetch HTML from URL
    let html: string
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
        }

        html = await response.text()
    } catch (error) {
        logger.error('Failed to fetch HTML from URL:', error)
        throw new Error(`Failed to fetch URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Extract title
    let title = extractTitle(html, url)

    // Extract image
    let imageUrl = extractImageUrl(html, url)

    if (!imageUrl) {
        throw new Error('No image found on the page')
    }

    return { title, imageUrl }
}

function extractTitle(html: string, baseUrl: string): string {
    let title = ''

    // Try Open Graph title
    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)
    if (ogTitleMatch) {
        title = ogTitleMatch[1].trim()
    } else {
        // Try Twitter Card title
        const twitterTitleMatch = html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i)
        if (twitterTitleMatch) {
            title = twitterTitleMatch[1].trim()
        } else {
            // Try HTML title tag
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
            if (titleMatch) {
                title = titleMatch[1].trim()
            } else {
                // Fallback to URL
                try {
                    const urlObj = new URL(baseUrl)
                    title = urlObj.hostname
                } catch {
                    title = 'Media Post'
                }
            }
        }
    }

    // Decode HTML entities
    return decodeHtmlEntities(title)
}

function decodeHtmlEntities(text: string): string {
    // Decode numeric entities (&#39;, &#8217;, etc.)
    text = text.replace(/&#(\d+);/g, (match, dec) => {
        return String.fromCharCode(parseInt(dec, 10))
    })

    // Decode hex entities (&#x27;, &#x2019;, etc.)
    text = text.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16))
    })

    // Decode named entities
    const entityMap: Record<string, string> = {
        '&apos;': "'",
        '&quot;': '"',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&nbsp;': ' ',
        '&rsquo;': "'",
        '&lsquo;': "'",
        '&rdquo;': '"',
        '&ldquo;': '"',
        '&mdash;': '—',
        '&ndash;': '–',
        '&hellip;': '…',
        '&copy;': '©',
        '&reg;': '®',
        '&trade;': '™',
    }

    for (const [entity, char] of Object.entries(entityMap)) {
        text = text.replace(new RegExp(entity, 'g'), char)
    }

    return text
}

function extractImageUrl(html: string, baseUrl: string): string | null {
    // Try Open Graph image
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
    if (ogImageMatch) {
        return resolveUrl(ogImageMatch[1], baseUrl)
    }

    // Try Twitter Card image
    const twitterImageMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i)
    if (twitterImageMatch) {
        return resolveUrl(twitterImageMatch[1], baseUrl)
    }

    // Try to find first large image in the page
    const imgMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)
    for (const match of imgMatches) {
        const imgSrc = match[1]
        const widthMatch = match[0].match(/width=["'](\d+)["']/i)
        const heightMatch = match[0].match(/height=["'](\d+)["']/i)

        // Prefer images with width > 200px
        if (widthMatch && parseInt(widthMatch[1]) > 200) {
            return resolveUrl(imgSrc, baseUrl)
        }

        // If no width specified, check if it's a common large image pattern
        if (!widthMatch && !heightMatch) {
            // Check for common image CDN patterns or large image filenames
            if (imgSrc.match(/(?:large|big|hero|banner|cover|featured)/i)) {
                return resolveUrl(imgSrc, baseUrl)
            }
        }
    }

    // Fallback: return first image found
    const firstImgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i)
    if (firstImgMatch) {
        return resolveUrl(firstImgMatch[1], baseUrl)
    }

    return null
}

function resolveUrl(url: string, baseUrl: string): string {
    // If URL is already absolute, return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }

    // If URL starts with //, add protocol
    if (url.startsWith('//')) {
        try {
            const baseUrlObj = new URL(baseUrl)
            return `${baseUrlObj.protocol}${url}`
        } catch {
            return url
        }
    }

    // Resolve relative URL
    try {
        return new URL(url, baseUrl).href
    } catch {
        return url
    }
}

