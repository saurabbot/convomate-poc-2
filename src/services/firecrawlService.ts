import { z } from 'zod';

const MediaSchema = z.object({
  url: z.string(),
  alt: z.string().optional(),
  title: z.string().optional(),
  type: z.enum(['image', 'video', 'audio']),
  size: z.string().optional(),
  format: z.string().optional(),
});

const TextContentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  headings: z.array(z.string()),
  paragraphs: z.array(z.string()),
  links: z.array(z.object({
    text: z.string(),
    url: z.string(),
  })),
});

const StructuredDataSchema = z.object({
  textContent: TextContentSchema,
  media: z.array(MediaSchema),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    author: z.string().optional(),
    publishDate: z.string().optional(),
    language: z.string().optional(),
    sourceUrl: z.string(),
    scrapedAt: z.string(),
  }),
});

type StructuredData = z.infer<typeof StructuredDataSchema>;
type MediaItem = z.infer<typeof MediaSchema>;

interface FirecrawlResponse {
  success: boolean;
  data: {
    markdown?: string;
    html?: string;
    json?: unknown;
    links?: string[];
    metadata: {
      title?: string;
      description?: string;
      keywords?: string;
      language?: string;
      sourceURL: string;
      statusCode: number;
    };
  };
  error?: string;
}

interface ScrapeOptions {
  formats?: ('markdown' | 'html' | 'json' | 'links')[];
  includeTags?: string[];
  excludeTags?: string[];
  onlyMainContent?: boolean;
  waitFor?: number;
  timeout?: number;
  customPrompt?: string;
  enableRetry?: boolean;
  maxRetries?: number;
}

export class FirecrawlService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.firecrawl.dev/v1';
  private readonly defaultTimeout = 30000;
  private readonly defaultMaxRetries = 3;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FIRECRAWL_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('Firecrawl API key not found. Please provide it via constructor or FIRECRAWL_API_KEY environment variable');
    }
  }

  async scrapeUrl(url: string, options: ScrapeOptions = {}): Promise<StructuredData> {
    this.validateUrl(url);

    const {
      formats = ['markdown', 'html', 'json', 'links'],
      includeTags = ['img', 'video', 'audio', 'source', 'picture'],
      excludeTags = ['script', 'style', 'nav', 'footer', 'aside'],
      onlyMainContent = true,
      waitFor = 2000,
      timeout = this.defaultTimeout,
      customPrompt,
      enableRetry = true,
      maxRetries = this.defaultMaxRetries,
    } = options;

    const payload = {
      url,
      formats: [
        ...formats.filter(f => f !== 'json'),
        {
          type: 'json',
          prompt: customPrompt || this.getDefaultExtractionPrompt(),
        },
      ],
      includeTags,
      excludeTags,
      onlyMainContent,
      waitFor,
      timeout,
    };

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= (enableRetry ? maxRetries : 0)) {
      try {
        const response = await this.makeRequest('/scrape', payload);
        return await this.processResponse(response, url);
      } catch (error) {
        lastError = error as Error;
        attempt++;
        
        if (attempt <= maxRetries && enableRetry) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.warn(`Scraping attempt ${attempt} failed for ${url}. Retrying in ${backoffDelay}ms...`);
          await this.sleep(backoffDelay);
        }
      }
    }

    throw new Error(`Failed to scrape ${url} after ${maxRetries + 1} attempts. Last error: ${lastError?.message}`);
  }


  async scrapeMultipleUrls(urls: string[], options: ScrapeOptions = {}, concurrency = 3): Promise<StructuredData[]> {
    const results: StructuredData[] = [];
    const errors: { url: string; error: string }[] = [];

    // Process URLs in batches to respect rate limits
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const batchPromises = batch.map(async (url) => {
        try {
          const result = await this.scrapeUrl(url, options);
          return { success: true, data: result, url };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ url, error: errorMessage });
          return { success: false, error: errorMessage, url };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach((result) => {
        if (result.success) {
          results.push(result.data);
        }
      });

      if (i + concurrency < urls.length) {
        await this.sleep(1000);
      }
    }

    if (errors.length > 0) {
      console.warn(`Failed to scrape ${errors.length} URLs:`, errors);
    }

    return results;
  }


  async extractWithSchema<T>(url: string, schema: z.ZodSchema<T>, prompt?: string): Promise<T> {
    this.validateUrl(url);

    const payload = {
      url,
      formats: [{
        type: 'json',
        schema: this.zodToJsonSchema(schema),
        prompt: prompt || 'Extract the data according to the provided schema',
      }],
      onlyMainContent: true,
      timeout: this.defaultTimeout,
    };

    const response = await this.makeRequest('/scrape', payload);
    
    if (!response.success || !response.data.json) {
      throw new Error(`Failed to extract data: ${response.error || 'No JSON data returned'}`);
    }

    try {
      return schema.parse(response.data.json);
    } catch (error) {
      throw new Error(`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown validation error'}`);
    }
  }

  private async makeRequest(endpoint: string, payload: Record<string, any>): Promise<FirecrawlResponse> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firecrawl API Error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  private async processResponse(response: FirecrawlResponse, originalUrl: string): Promise<StructuredData> {
    if (!response.success) {
      throw new Error(`Scraping failed: ${response.error || 'Unknown error'}`);
    }

    const { data } = response;
    
    const textContent = this.extractTextContent(data.markdown || '', data.html || '');
    
    const media = this.extractMediaItems(data.json, data.html || '');
    
    const metadata = {
      title: data.metadata.title,
      description: data.metadata.description,
      keywords: data.metadata.keywords ? data.metadata.keywords.split(',').map(k => k.trim()) : [],
      language: data.metadata.language,
      sourceUrl: originalUrl,
      scrapedAt: new Date().toISOString(),
    };

    return {
      textContent,
      media,
      metadata,
    };
  }

  private extractTextContent(markdown: string, html: string): typeof TextContentSchema {
    const titleMatch = markdown.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : '';

    const headings = [...markdown.matchAll(/^#{1,6} (.+)$/gm)]
      .map(match => match[1])
      .filter(heading => heading !== title);

    const paragraphs = markdown
      .split('\n')
      .filter(line => line.trim() && !line.match(/^#{1,6} /))
      .filter(line => line.length > 20);

    const linkMatches = [...markdown.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
    const links = linkMatches.map(match => ({
      text: match[1],
      url: match[2],
    }));

    return {
      title,
      headings,
      paragraphs,
      links,
    };
  }

  private extractMediaItems(jsonData: any, html: string): MediaItem[] {
    const media: MediaItem[] = [];

    if (jsonData && jsonData.media) {
      media.push(...jsonData.media);
    }

    const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi)];
    imgMatches.forEach(match => {
      media.push({
        url: match[1],
        alt: match[2] || '',
        type: 'image' as const,
      });
    });

    const videoMatches = [...html.matchAll(/<video[^>]+src=["']([^"']+)["'][^>]*>/gi)];
    videoMatches.forEach(match => {
      media.push({
        url: match[1],
        type: 'video' as const,
      });
    });

    const audioMatches = [...html.matchAll(/<audio[^>]+src=["']([^"']+)["'][^>]*>/gi)];
    audioMatches.forEach(match => {
      media.push({
        url: match[1],
        type: 'audio' as const,
      });
    });

    return media.filter((item, index, self) => 
      index === self.findIndex(m => m.url === item.url)
    );
  }

  private getDefaultExtractionPrompt(): string {
    return `Extract comprehensive information from this webpage including:
    1. All text content organized by headings and paragraphs
    2. All media files (images, videos, audio) with their URLs and metadata
    3. All links with their text and URLs
    4. Page metadata like title, description, and keywords
    
    Structure the data clearly and include as much detail as possible.`;
  }

  private validateUrl(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid URL provided: ${url}`);
    }
  }

  private zodToJsonSchema(schema: z.ZodSchema<any>): any {

    return {
      type: 'object',
      properties: {},
      required: [],
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async healthCheck(): Promise<boolean> {
    try {
      const testUrl = 'https://example.com';
      await this.scrapeUrl(testUrl, { 
        formats: ['markdown'], 
        timeout: 10000,
        enableRetry: false,
      });
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Usage example
export async function example() {
  const firecrawl = new FirecrawlService();
  
  try {
    const result = await firecrawl.scrapeUrl('https://example.com');
    console.log('Extracted text:', result.textContent.title);
    console.log('Found media items:', result.media.length);
    
    const urls = ['https://example.com', 'https://another-site.com'];
    const results = await firecrawl.scrapeMultipleUrls(urls);
    
    const customSchema = z.object({
      productName: z.string(),
      price: z.string(),
      images: z.array(z.string()),
    });
    
    const product = await firecrawl.extractWithSchema(
      'https://ecommerce-site.com/product',
      customSchema,
      'Extract product information including name, price, and image URLs'
    );
    
  } catch (error) {
    console.error('Scraping failed:', error);
  }
}
