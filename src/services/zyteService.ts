export interface ProductInterface {
    url: string;
    statusCode: number;
    browserHtml: string;
    product: Product;
  }
  
  export interface Product {
    name: string;
    price: string;
    sku: string;
    mainImage: Image;
    images?: Image[];
    videos?: Video[];
    description: string;
    descriptionHtml: string;
    aggregateRating?: AggregateRating;
    additionalProperties?: AdditionalProperty[];
    url: string;
    canonicalUrl: string;
    metadata: Metadata;
  }
  
  export interface Image {
    url: string;
  }
  
  export interface Video {
    url: string;
  }
  
  export interface AggregateRating {
    reviewCount: number;
  }
  
  export interface AdditionalProperty {
    name: string;
    value: string;
  }
  
  export interface Metadata {
    probability: number;
    dateDownloaded: string; // ISO date string
  }
  
  export enum ScrapType {
    PRODUCT = "product",
  }
  
export class ZyteService {
  async getStructuredScrapedData(
    url: string,
    scrapType: ScrapType
  ): Promise<ProductInterface> {
    const apiKey = process.env.ZYTE_API_KEY;
    if (!apiKey)
      throw new Error("Zyte API key not found in environment variables");

    const payload = {
      url,
      browserHtml: true,
      product: scrapType === ScrapType.PRODUCT,
      productOptions: { extractFrom: "browserHtml" },
    };
    console.log("Payload:", payload);

    const response = await fetch("https://api.zyte.com/v1/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${apiKey}:`).toString("base64"),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zyte API Error: ${response.status} ${errorText}`);
    }

    return response.json() as Promise<ProductInterface>;
  }
}
