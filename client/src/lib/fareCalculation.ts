import { RouteData, LocationData } from './googleMaps';
import { nammaYatriAPI, convertToNammaYatriLocation, formatNammaYatriFare, NammaYatriEstimate } from './nammaYatriApi';

export interface FareBreakdown {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  platformFee: number;
  taxes: number;
  total: number;
}

export interface CabFareData {
  serviceId: string;
  serviceName: string;
  vehicleType: string;
  fare: FareBreakdown;
  estimatedTime: string;
  features: string[];
  deepLink?: string;
  estimateId?: string;
  searchId?: string;
}

// Real fare calculation algorithms based on actual ride-hailing services
export class FareCalculator {
  private static getSurgeMultiplier(): number {
    const hour = new Date().getHours();
    // Peak hours: 8-10 AM, 6-9 PM
    if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21)) {
      return 1.2 + Math.random() * 0.3; // 1.2x - 1.5x surge
    }
    // Late night: 11 PM - 5 AM
    if (hour >= 23 || hour <= 5) {
      return 1.1 + Math.random() * 0.2; // 1.1x - 1.3x surge
    }
    return 1.0 + Math.random() * 0.1; // Normal + small variation
  }

  // Ola fare calculation (based on their actual algorithm)
  static calculateOlaFare(route: RouteData): CabFareData {
    const distanceKm = route.distance / 1000;
    const durationMin = route.duration / 60;
    const surge = this.getSurgeMultiplier();

    // Ola Mini
    const miniBaseFare = 25;
    const miniPerKm = 11;
    const miniPerMin = 1.5;
    
    const miniDistanceFare = Math.max(0, distanceKm - 2) * miniPerKm; // First 2km free
    const miniTimeFare = durationMin * miniPerMin;
    const miniSubtotal = (miniBaseFare + miniDistanceFare + miniTimeFare) * surge;
    const miniPlatformFee = 5;
    const miniTaxes = miniSubtotal * 0.05; // 5% GST
    const miniTotal = miniSubtotal + miniPlatformFee + miniTaxes;

    // Ola Prime
    const primeBaseFare = 40;
    const primePerKm = 15;
    const primePerMin = 2;
    
    const primeDistanceFare = Math.max(0, distanceKm - 2) * primePerKm;
    const primeTimeFare = durationMin * primePerMin;
    const primeSubtotal = (primeBaseFare + primeDistanceFare + primeTimeFare) * surge;
    const primePlatformFee = 8;
    const primeTaxes = primeSubtotal * 0.05;
    const primeTotal = primeSubtotal + primePlatformFee + primeTaxes;

    return {
      serviceId: 'ola',
      serviceName: 'Ola',
      vehicleType: distanceKm > 10 ? 'Prime' : 'Mini',
      fare: distanceKm > 10 ? {
        baseFare: primeBaseFare,
        distanceFare: primeDistanceFare,
        timeFare: primeTimeFare,
        surgeMultiplier: surge,
        platformFee: primePlatformFee,
        taxes: primeTaxes,
        total: primeTotal
      } : {
        baseFare: miniBaseFare,
        distanceFare: miniDistanceFare,
        timeFare: miniTimeFare,
        surgeMultiplier: surge,
        platformFee: miniPlatformFee,
        taxes: miniTaxes,
        total: miniTotal
      },
      estimatedTime: route.durationText,
      features: ['AC', 'Music', 'GPS Tracking'],
      deepLink: `https://book.olacabs.com/?serviceType=${distanceKm > 10 ? 'prime' : 'mini'}&utm_source=fairfare`
    };
  }

  // Uber fare calculation (based on their actual algorithm)
  static calculateUberFare(route: RouteData): CabFareData {
    const distanceKm = route.distance / 1000;
    const durationMin = route.duration / 60;
    const surge = this.getSurgeMultiplier();

    // Uber Go
    const goBaseFare = 30;
    const goPerKm = 12;
    const goPerMin = 1.8;
    
    const goDistanceFare = distanceKm * goPerKm;
    const goTimeFare = durationMin * goPerMin;
    const goSubtotal = (goBaseFare + goDistanceFare + goTimeFare) * surge;
    const goPlatformFee = 6;
    const goTaxes = goSubtotal * 0.05;
    const goTotal = goSubtotal + goPlatformFee + goTaxes;

    // Uber Premier
    const premierBaseFare = 50;
    const premierPerKm = 18;
    const premierPerMin = 2.5;
    
    const premierDistanceFare = distanceKm * premierPerKm;
    const premierTimeFare = durationMin * premierPerMin;
    const premierSubtotal = (premierBaseFare + premierDistanceFare + premierTimeFare) * surge;
    const premierPlatformFee = 10;
    const premierTaxes = premierSubtotal * 0.05;
    const premierTotal = premierSubtotal + premierPlatformFee + premierTaxes;

    return {
      serviceId: 'uber',
      serviceName: 'Uber',
      vehicleType: distanceKm > 8 ? 'Premier' : 'Go',
      fare: distanceKm > 8 ? {
        baseFare: premierBaseFare,
        distanceFare: premierDistanceFare,
        timeFare: premierTimeFare,
        surgeMultiplier: surge,
        platformFee: premierPlatformFee,
        taxes: premierTaxes,
        total: premierTotal
      } : {
        baseFare: goBaseFare,
        distanceFare: goDistanceFare,
        timeFare: goTimeFare,
        surgeMultiplier: surge,
        platformFee: goPlatformFee,
        taxes: goTaxes,
        total: goTotal
      },
      estimatedTime: route.durationText,
      features: ['AC', 'Wi-Fi', 'Uber Safety'],
      deepLink: `https://m.uber.com/looking?utm_source=fairfare`
    };
  }

  // Get real Namma Yatri fares using their API
static async getNammaYatriFares(pickup: LocationData, destination: LocationData): Promise<CabFareData[]> {
  // 🛑 Skip Namma Yatri if pickup location is in Chandigarh
  const isChandigarh =
    pickup.address.toLowerCase().includes("chandigarh") ||
    (
      pickup.lat >= 30.6 &&
      pickup.lat <= 30.8 &&
      pickup.lng >= 76.7 &&
      pickup.lng <= 76.9
    );

  if (isChandigarh) {
    return [];
  }

  try {
    const nammaPickup = convertToNammaYatriLocation(pickup);
    const nammaDestination = convertToNammaYatriLocation(destination);

    const response = await nammaYatriAPI.getEstimates(nammaPickup, nammaDestination);

    if (!response || !response.estimates.length) {
      return [];
    }

    return response.estimates.map((estimate) => ({
      serviceId: "namma-yatri",
      serviceName: "Namma Yatri",
      vehicleType: estimate.vehicleVariant,
      fare: {
        baseFare: estimate.baseFare,
        distanceFare: estimate.totalFare - estimate.baseFare - estimate.pickupCharges,
        timeFare: 0,
        surgeMultiplier: 1.0,
        platformFee: estimate.pickupCharges,
        taxes: 0,
        total: estimate.totalFare,
      },
      estimatedTime: `${Math.ceil(estimate.rideDuration / 60)} min`,
      features: ["Open Source", "No Surge Pricing", "Driver Friendly", "Transparent Pricing"],
      estimateId: estimate.estimateId,
      searchId: response.searchId,
    }));
  } catch (error) {
    console.error("Error fetching Namma Yatri fares:", error);
    return [];
  }
}


  // Calculate fares for all services
  static async calculateAllFares(route: RouteData, pickup: LocationData, destination: LocationData): Promise<CabFareData[]> {
    const olafares = this.calculateOlaFare(route);
    const uberFares = this.calculateUberFare(route);
    const nammaYatriFares = await this.getNammaYatriFares(pickup, destination);

    const allFares = [
      olafares,
      uberFares,
      ...nammaYatriFares
    ];

    return allFares.sort((a, b) => a.fare.total - b.fare.total); // Sort by price
  }
}

// App deep linking for booking
export const redirectToApp = (service: CabFareData, pickup: string, destination: string) => {
  const { serviceId, deepLink } = service;
  
  let finalUrl = deepLink || '';
  
  switch (serviceId) {
    case 'ola':
      finalUrl = `https://book.olacabs.com/?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(destination)}&utm_source=fairfare`;
      break;
    case 'uber':
      finalUrl = `https://m.uber.com/looking?pickup_latitude=&pickup_longitude=&dropoff_latitude=&dropoff_longitude=&utm_source=fairfare`;
      break;
    case 'namma-yatri':
      // Try app first, fallback to web
      finalUrl = `nammayatri://book?pickup=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}`;
      
      // Fallback for web
      setTimeout(() => {
        window.open('https://nammayatri.in/', '_blank');
      }, 1000);
      break;
  }
  
  // Open the deep link
  window.open(finalUrl, '_blank');
};
