import { ApifyClient } from 'apify-client';
import logger from '../utils/logger';
import { config } from '../config';

// Airbnb listing data structure (matching the provided JSON structure)
export interface AirbnbListingData {
  identifier: string;
  url: string;
  active: boolean;
  headline: string;
  name: string;
  description: string;
  story: string;
  unit: {
    identifier: string;
    active: boolean;
    name: string;
    category: string;
    area: {
      size: number | null;
      unit: string | null;
    };
  };
  features: Array<{
    name: string;
    description: string;
  }>;
  safety_features: Array<{
    name: string;
    note: string;
  }>;
  bathrooms: any[];
  bedrooms: any[];
  images: Array<{
    identifier: string;
    url: string;
    title: string;
  }>;
  location: {
    address: {
      primary: string;
      secondary: string;
      city: string;
      subdivision: string;
      postcode: string;
      country: string;
    };
    coordinates: {
      lat: number;
      lng: number;
    };
    show_exact: boolean;
  };
  supplement: {
    max_sleeps: number;
    allows_children: boolean;
    max_guests: number;
    allows_pets: boolean;
    allows_events: boolean;
    cancellation_policy: string;
  };
  host: {
    host: {
      name: string;
      profilePictureUrl: string;
    };
    title: string;
    superhost: boolean;
    verified: boolean;
    stats: Array<{
      label: string;
      value: string;
      type: string;
    }>;
    host_highlights: Array<{
      title: string;
    }>;
    co_hosts: any[];
    host_details: string[];
  };
  rating: any;
}

export interface AirbnbScrapingResponse {
  success: boolean;
  data?: AirbnbListingData;
  error?: string;
}

export class AirbnbService {
  private static readonly APIFY_API_URL = config.apify.apiUrl;
  private static readonly APIFY_API_TOKEN = config.apify.apiToken;
  private static readonly APIFY_USER_ID = config.apify.userId;
  private static readonly ACTOR_ID = config.apify.actorId;

  /**
   * Validate that a URL is a valid Airbnb listing URL
   * @param url - The URL to validate
   * @returns boolean indicating if URL is valid
   */
  public static validateAirbnbUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Check if it's an Airbnb domain and contains /rooms/ path
      return (
        (urlObj.hostname === 'www.airbnb.com' || urlObj.hostname === 'airbnb.com') &&
        urlObj.pathname.includes('/rooms/')
      );
    } catch {
      return false;
    }
  }

  /**
   * Extract listing ID from Airbnb URL
   * @param url - The Airbnb listing URL
   * @returns Listing ID or null
   */
  public static extractListingId(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const roomsIndex = pathParts.indexOf('rooms');
      
      if (roomsIndex !== -1 && pathParts.length > roomsIndex + 1) {
        // Extract ID, removing any query parameters
        return pathParts[roomsIndex + 1].split('?')[0];
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Scrape Airbnb listing data using Apify Actor
   * @param url - The Airbnb listing URL
   * @returns Promise with scraped data or error
   */
  public static async scrapeListing(url: string): Promise<AirbnbScrapingResponse> {
    console.log(`[AirbnbService] ===== STARTING SCRAPE =====`);
    console.log(`[AirbnbService] URL: ${url}`);
    logger.info(`[AirbnbService] Starting Airbnb scraping for URL: ${url}`);

    try {
      // Validate URL
      if (!this.validateAirbnbUrl(url)) {
        logger.error(`[AirbnbService] Invalid Airbnb URL: ${url}`);
        return {
          success: false,
          error: 'Invalid Airbnb URL. Please provide a valid Airbnb listing URL (e.g., https://www.airbnb.com/rooms/...)'
        };
      }

      // Extract listing ID
      const listingId = this.extractListingId(url);
      if (!listingId) {
        logger.error(`[AirbnbService] Could not extract listing ID from URL: ${url}`);
        return {
          success: false,
          error: 'Could not extract listing ID from URL'
        };
      }

      console.log(`[AirbnbService] Extracted listing ID: ${listingId}`);
      logger.info(`[AirbnbService] Extracted listing ID: ${listingId}`);

      // Check if Apify API token is configured
      if (!this.APIFY_API_TOKEN) {
        logger.warn(`[AirbnbService] APIFY_API_TOKEN not configured, using mock data`);
        console.log(`[AirbnbService] Using mock data (Apify not configured)`);
        return this.getMockListingData(url, listingId);
      }

      // Initialize Apify Client
      console.log(`[AirbnbService] Initializing Apify Client...`);
      const client = new ApifyClient({
        token: this.APIFY_API_TOKEN,
      });

      // Call Apify Actor to scrape the listing
      console.log(`[AirbnbService] Calling Apify Actor: ${this.ACTOR_ID}`);
      logger.info(`[AirbnbService] Calling Apify Actor: ${this.ACTOR_ID}`);

      const actorInput = {
        urls: [url],
        maxListings: 1
      };

      console.log(`[AirbnbService] Actor input:`, JSON.stringify(actorInput, null, 2));
      logger.info(`[AirbnbService] Starting Apify Actor run`);

      try {
        // Run the Actor and wait for it to finish
        console.log(`[AirbnbService] Running Apify Actor...`);
        const run = await client.actor(this.ACTOR_ID).call(actorInput, {
          waitSecs: 120, // wait up to 2 minutes for the run to finish
        });

        console.log(`[AirbnbService] Actor run finished. Status: ${run.status}`);
        logger.info(`[AirbnbService] Actor run finished. Run ID: ${run.id}, Status: ${run.status}`);

        if (run.status !== 'SUCCEEDED') {
          logger.error(`[AirbnbService] Actor run failed with status: ${run.status}`);
          return {
            success: false,
            error: `Actor run failed with status: ${run.status}`
          };
        }

        // Fetch results from the run's dataset
        console.log(`[AirbnbService] Fetching dataset items...`);
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log(`[AirbnbService] Got ${items.length} results from dataset`);
        logger.info(`[AirbnbService] Retrieved ${items.length} items from dataset`);

        if (!items || items.length === 0) {
          logger.error(`[AirbnbService] No results returned from Actor`);
          return {
            success: false,
            error: 'No data returned from scraper'
          };
        }

        const listingData = items[0] as AirbnbListingData;
        console.log(`[AirbnbService] Successfully scraped listing: ${listingData.headline}`);
        logger.info(`[AirbnbService] Successfully scraped listing: ${listingData.headline}`);

        console.log(`[AirbnbService] ===== SCRAPING COMPLETE =====`);

        return {
          success: true,
          data: listingData
        };
      } catch (apifyError: any) {
        console.log(`[AirbnbService] Apify API Error:`, apifyError.message);
        logger.error(`[AirbnbService] Apify API error: ${apifyError.message}`);
        return {
          success: false,
          error: `Apify API error: ${apifyError.message}`
        };
      }

    } catch (error: any) {
      console.log(`[AirbnbService] ===== ERROR OCCURRED =====`);
      console.log(`[AirbnbService] Error:`, error.message);
      logger.error(`[AirbnbService] Error scraping Airbnb listing:`, error);

      if (error.response) {
        console.log(`[AirbnbService] API Error Response:`, error.response.status, error.response.data);
        return {
          success: false,
          error: `API error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`
        };
      } else if (error.request) {
        console.log(`[AirbnbService] Network error - no response`);
        return {
          success: false,
          error: 'Network error: Unable to reach scraping service'
        };
      } else {
        return {
          success: false,
          error: `Unexpected error: ${error.message}`
        };
      }
    }
  }

  /**
   * Get mock listing data for development/testing
   * @param url - The Airbnb listing URL
   * @param listingId - The extracted listing ID
   * @returns Mock listing data
   */
  private static getMockListingData(url: string, listingId: string): AirbnbScrapingResponse {
    // Return the exact structure from the provided JSON
    const mockData: AirbnbListingData = {
      identifier: listingId,
      url: url,
      active: true,
      headline: "Classy and Roomy l Old Town l Next to Dubai Mall",
      name: "Rental unit in Dubai · ★New · 1 bedroom · 1.5 baths",
      description: "\nStay in the heart of Downtown Dubai in this spacious 1-bedroom apartment with a classy, timeless design. Enjoy high-end furniture, warm tones, and elegant details that reflect Old Town's charm.<br />The apartment features a bright living area, fully equipped kitchen, queen-size bed, balcony, and fast Wi-Fi.<br />Just steps from Souk Al Bahar, Dubai Mall, and Burj Khalifa, yet tucked in a peaceful, traditional setting — perfect for both leisure and business stays.\nRegistration Details\nBUR-KAM-URGSB",
      story: "",
      unit: {
        identifier: listingId,
        active: true,
        name: "Rental unit in Dubai · ★New · 1 bedroom · 1.5 baths",
        category: "PROPERTY_TYPE_APARTMENT",
        area: {
          size: null,
          unit: null
        }
      },
      features: [
        { name: "Washer", description: "" },
        { name: "TV", description: "" },
        { name: "Air conditioning", description: "" },
        { name: "Smoke alarm", description: "" },
        { name: "Fire extinguisher", description: "" },
        { name: "First aid kit", description: "" },
        { name: "Wifi", description: "" },
        { name: "Dedicated workspace", description: "" },
        { name: "Kitchen", description: "Space where guests can cook their own meals" },
        { name: "Outdoor dining area", description: "" },
        { name: "Free parking garage on premises", description: "" },
        { name: "Pool", description: "" }
      ],
      safety_features: [
        { name: "Smoke alarm", note: "" },
        { name: "Fire extinguisher", note: "" },
        { name: "First aid kit", note: "" }
      ],
      bathrooms: [],
      bedrooms: [],
      images: [
        {
          identifier: listingId,
          url: "https://a0.muscache.com/im/pictures/hosting/Hosting-1528180770610140527/original/39be7ca6-171e-4c69-a2f5-e1f4e24603a2.jpeg",
          title: ""
        }
      ],
      location: {
        address: {
          primary: "",
          secondary: "",
          city: "Dubai",
          subdivision: "",
          postcode: "",
          country: "United Arab Emirates"
        },
        coordinates: {
          lat: 25.1894,
          lng: 55.2757
        },
        show_exact: true
      },
      supplement: {
        max_sleeps: 12,
        allows_children: false,
        max_guests: 2,
        allows_pets: false,
        allows_events: false,
        cancellation_policy: "MODERATE"
      },
      host: {
        host: {
          name: "Daria",
          profilePictureUrl: "https://a0.muscache.com/im/pictures/user/aa744a74-1fd2-4cdb-8d88-1585e2696ae5.jpg"
        },
        title: "Superhost",
        superhost: true,
        verified: true,
        stats: [
          { label: "Reviews", value: "966", type: "REVIEW_COUNT" },
          { label: "Rating", value: "4.84", type: "RATING" },
          { label: "Years hosting", value: "4", type: "YEARS_HOSTING" }
        ],
        host_highlights: [
          { title: "My work: hospitality" },
          { title: "Favorite song in high school: supergirl" }
        ],
        co_hosts: [],
        host_details: [
          "Response rate: 100%",
          "Responds within an hour"
        ]
      },
      rating: null
    };

    return {
      success: true,
      data: mockData
    };
  }

  /**
   * Map Airbnb listing data to Property creation data
   * This transforms the Airbnb JSON structure into our Property model format
   * @param airbnbData - The scraped Airbnb listing data
   * @param ownerId - The ID of the owner to assign the property to
   * @param agentId - Optional agent ID
   * @returns Mapped property data ready for PropertyService.create()
   */
  public static mapAirbnbToProperty(
    airbnbData: AirbnbListingData,
    ownerId: string,
    agentId?: string
  ): any {
    logger.info(`[AirbnbService] Mapping Airbnb data to Property format`);
    console.log(`[AirbnbService] Mapping listing: ${airbnbData.headline}`);

    // Extract amenities from features
    const amenities = airbnbData.features.map(f => f.name);

    // Determine property type based on unit category
    let propertyType = 'APARTMENT'; // Default
    if (airbnbData.unit.category.includes('HOUSE')) propertyType = 'HOUSE';
    else if (airbnbData.unit.category.includes('VILLA')) propertyType = 'VILLA';
    else if (airbnbData.unit.category.includes('STUDIO')) propertyType = 'STUDIO';

    // Build full address
    const addressParts = [
      airbnbData.location.address.primary,
      airbnbData.location.address.secondary,
      airbnbData.location.address.city,
      airbnbData.location.address.country
    ].filter(Boolean);
    const fullAddress = addressParts.join(', ') || 'Address not provided';

    // Extract bedrooms and bathrooms count (default to 1 if not found)
    const bedroomsMatch = airbnbData.name.match(/(\d+)\s+bedroom/);
    const bathroomsMatch = airbnbData.name.match(/(\d+\.?\d*)\s+bath/);
    
    const bedrooms = bedroomsMatch ? parseInt(bedroomsMatch[1]) : 1;
    const bathrooms = bathroomsMatch ? parseFloat(bathroomsMatch[1]) : 1;

    // Parse beds configuration from bedrooms array
    const bedsConfiguration = airbnbData.bedrooms && airbnbData.bedrooms.length > 0
      ? airbnbData.bedrooms.map((bedroom: any, index: number) => ({
          room: bedroom.name || `Bedroom ${index + 1}`,
          bedType: bedroom.beds?.[0]?.type || 'Unknown',
          count: bedroom.beds?.length || 1
        }))
      : null;

    // Extract rating and review count
    let externalRating: number | undefined = undefined;
    let externalReviewCount: number | undefined = undefined;

    if (airbnbData.rating) {
      externalRating = parseFloat(airbnbData.rating.overall_rating || airbnbData.rating);
    }

    // Try to get review count from host stats or rating
    if (airbnbData.host?.stats) {
      const reviewStat = airbnbData.host.stats.find((s: any) => s.type === 'REVIEW_COUNT');
      if (reviewStat) {
        externalReviewCount = parseInt(reviewStat.value);
      }
    }

    // Also try to extract rating from name (e.g., "★4.63")
    if (!externalRating) {
      const ratingMatch = airbnbData.name.match(/★(\d+\.?\d*)/);
      if (ratingMatch) {
        externalRating = parseFloat(ratingMatch[1]);
      }
    }

    const propertyData = {
      name: airbnbData.headline,
      nickname: airbnbData.headline,
      title: airbnbData.name,
      type: propertyType,
      typeOfUnit: 'SINGLE', // SINGLE or SHARED
      address: fullAddress,
      city: airbnbData.location.address.city || 'Unknown',
      country: airbnbData.location.address.country || 'Unknown',
      latitude: airbnbData.location.coordinates.lat,
      longitude: airbnbData.location.coordinates.lng,
      capacity: airbnbData.supplement.max_guests,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      area: airbnbData.unit.area.size || undefined,
      pricePerNight: 100, // Default price, needs to be set manually
      description: airbnbData.description,
      summary: airbnbData.headline,
      theSpace: airbnbData.story || airbnbData.description,
      amenities: amenities,
      houseRules: [], // Airbnb doesn't provide house rules in this format
      tags: ['imported-from-airbnb', `airbnb-${airbnbData.identifier}`],
      ownerId: ownerId,
      agentId: agentId,
      isActive: true,
      isPublished: false, // Set to false initially, let user review before publishing
      
      // Store Airbnb URL and ID for reference
      airbnbUrl: airbnbData.url,
      airbnbId: airbnbData.identifier,
      
      // Additional metadata
      minStay: 3,
      maxStay: 365,
      checkInTime: '15:00',
      checkOutTime: '12:00',
      
      // NEW: Airbnb enrichment fields
      bedsConfiguration: bedsConfiguration,
      externalRating: externalRating,
      externalReviewCount: externalReviewCount,
      allowsPets: airbnbData.supplement.allows_pets,
      externalCancellationPolicy: airbnbData.supplement.cancellation_policy,
      
      // Photos will be handled separately
      photos: airbnbData.images.map((img, index) => ({
        url: img.url,
        isCover: index === 0,
        alt: airbnbData.headline,
        order: index
      }))
    };

    console.log(`[AirbnbService] Mapped property data:`, JSON.stringify(propertyData, null, 2));
    logger.info(`[AirbnbService] Property mapping completed for: ${propertyData.name}`);

    return propertyData;
  }
}

