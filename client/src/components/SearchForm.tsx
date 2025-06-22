
import { useState } from 'react';
import { MapPin, Calendar, Clock, Search, ArrowUpDown, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import LocationSearch from './LocationSearch';
import { LocationData } from '@/lib/googleMaps';

interface SearchFormProps {
  onSearch: (data: SearchData) => void;
}

export interface SearchData {
  pickup: LocationData;
  destination: LocationData;
  date: string;
  time: string;
}

const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [pickup, setPickup] = useState<LocationData | null>(null);
  const [destination, setDestination] = useState<LocationData | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pickup && destination) {
      onSearch({ pickup, destination, date, time });
    }
  };

  const swapLocations = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();
            if (data.results[0]) {
              setPickup({
                address: data.results[0].formatted_address,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                placeId: data.results[0].place_id
              });
            }
          } catch (error) {
            console.error('Error getting current location:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0 bg-black/90 backdrop-blur-sm">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-yellow-500" />
                Pickup Location
              </label>
              <div className="flex gap-2">
                <LocationSearch
                  placeholder="Enter pickup address"
                  value={pickup?.address || ''}
                  onChange={setPickup}
                  icon={<MapPin className="h-4 w-4" />}
                />
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  className="px-3 bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-yellow-500" />
                Destination
              </label>
              <div className="flex gap-2">
                <LocationSearch
                  placeholder="Enter destination address"
                  value={destination?.address || ''}
                  onChange={setDestination}
                  icon={<MapPin className="h-4 w-4" />}
                />
                <Button
                  type="button"
                  onClick={swapLocations}
                  className="px-3 bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-500" />
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 text-lg border-2 border-yellow-500 focus:border-yellow-400 transition-colors bg-black text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                Time
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-12 text-lg border-2 border-yellow-500 focus:border-yellow-400 transition-colors bg-black text-white"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Search className="mr-2 h-5 w-5" />
            Compare Prices
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;
