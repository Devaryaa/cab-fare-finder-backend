// Namma Yatri Open Source API Integration
// Based on their GitHub: https://github.com/nammayatri/nammayatri

export interface NammaYatriLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface NammaYatriEstimate {
  estimateId: string;
  vehicleVariant: string;
  totalFare: number;
  baseFare: number;
  pickupCharges: number;
  waitingCharges: number;
  rideDistance: number;
  rideDuration: number;
  nightShiftCharge: number;
  currency: string;
  descriptions: string[];
}

export interface NammaYatriQuoteResponse {
  estimates: NammaYatriEstimate[];
  searchId: string;
}

class NammaYatriAPI {
  private baseUrl = 'https://nammayatri.in/api'; // Production API endpoint
  
  // Get fare estimates from pickup to destination
  async getEstimates(
    pickup: NammaYatriLocation, 
    destination: NammaYatriLocation
  ): Promise<NammaYatriQuoteResponse | null> {
    try {
      // First, create a search request
      const searchResponse = await fetch(`${this.baseUrl}/rideSearch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          contents: {
            origin: {
              gps: {
                lat: pickup.lat,
                lon: pickup.lng
              },
              address: {
                fullAddress: pickup.address
              }
            },
            destination: {
              gps: {
                lat: destination.lat,
                lon: destination.lng
              },
              address: {
                fullAddress: destination.address
              }
            }
          }
        })
      });

      if (!searchResponse.ok) {
        console.error('Namma Yatri search failed:', searchResponse.status);
        return null;
      }

      const searchData = await searchResponse.json();
      const searchId = searchData.searchId;

      if (!searchId) {
        console.error('No search ID received from Namma Yatri');
        return null;
      }

      // Wait a moment for estimates to be calculated
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the estimates for the search
      const estimatesResponse = await fetch(`${this.baseUrl}/estimates?searchId=${searchId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!estimatesResponse.ok) {
        console.error('Namma Yatri estimates failed:', estimatesResponse.status);
        return null;
      }

      const estimatesData = await estimatesResponse.json();
      
      return {
        estimates: estimatesData.estimates || [],
        searchId
      };

    } catch (error) {
      console.error('Namma Yatri API error:', error);
      return null;
    }
  }

  // Book a ride (redirects to app)
  async bookRide(estimateId: string, searchId: string): Promise<string> {
    // Generate deep link for Namma Yatri app
    const deepLink = `nammayatri://book?estimateId=${estimateId}&searchId=${searchId}`;
    
    // Try to open the app, fallback to web
    try {
      window.location.href = deepLink;
      
      // Fallback to web booking after 1 second
      setTimeout(() => {
        window.open(`https://nammayatri.in/book?estimateId=${estimateId}&searchId=${searchId}`, '_blank');
      }, 1000);
      
      return deepLink;
    } catch (error) {
      // Direct web fallback
      const webUrl = `https://nammayatri.in/book?estimateId=${estimateId}&searchId=${searchId}`;
      window.open(webUrl, '_blank');
      return webUrl;
    }
  }

  // Get available vehicle types
  async getVehicleTypes(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vehicleTypes`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        return ['AUTO_RICKSHAW', 'CAB', 'BIKE']; // Fallback
      }

      const data = await response.json();
      return data.vehicleTypes || ['AUTO_RICKSHAW', 'CAB', 'BIKE'];
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
      return ['AUTO_RICKSHAW', 'CAB', 'BIKE']; // Fallback
    }
  }
}

export const nammaYatriAPI = new NammaYatriAPI();

// Utility function to convert Google Maps location to Namma Yatri format
export const convertToNammaYatriLocation = (location: {
  lat: number;
  lng: number;
  address: string;
}): NammaYatriLocation => ({
  lat: location.lat,
  lng: location.lng,
  address: location.address
});

// Format fare for display
export const formatNammaYatriFare = (estimate: NammaYatriEstimate) => ({
  serviceId: 'namma-yatri',
  serviceName: 'Namma Yatri',
  vehicleType: estimate.vehicleVariant,
  price: estimate.totalFare,
  originalPrice: estimate.totalFare, // No surge pricing
  rating: 4.2, // Average rating
  reviews: 15000,
  estimatedTime: `${Math.ceil(estimate.rideDuration / 60)} min`,
  capacity: estimate.vehicleVariant === 'AUTO_RICKSHAW' ? 3 : 4,
  features: ['Open Source', 'No Surge Pricing', 'Driver Friendly', 'Transparent Pricing'],
  isRecommended: true, // Usually cheapest
  carType: estimate.vehicleVariant,
  fareBreakdown: {
    baseFare: estimate.baseFare,
    pickupCharges: estimate.pickupCharges,
    waitingCharges: estimate.waitingCharges,
    nightShiftCharge: estimate.nightShiftCharge,
    total: estimate.totalFare,
    currency: estimate.currency,
    distance: estimate.rideDistance,
    duration: estimate.rideDuration
  },
  estimateId: estimate.estimateId
});