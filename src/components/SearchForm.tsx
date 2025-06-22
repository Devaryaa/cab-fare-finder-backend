
import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface SearchFormProps {
  onSearch: (data: SearchData) => void;
}

export interface SearchData {
  pickup: string;
  destination: string;
  date: string;
  time: string;
}

const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [formData, setFormData] = useState<SearchData>({
    pickup: '',
    destination: '',
    date: '',
    time: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(formData);
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
              <Input
                type="text"
                placeholder="Enter pickup address"
                value={formData.pickup}
                onChange={(e) => setFormData({ ...formData, pickup: e.target.value })}
                className="h-12 text-lg border-2 border-yellow-500 focus:border-yellow-400 transition-colors bg-black text-white placeholder:text-gray-400"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-yellow-500 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-yellow-500" />
                Destination
              </label>
              <Input
                type="text"
                placeholder="Enter destination address"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="h-12 text-lg border-2 border-yellow-500 focus:border-yellow-400 transition-colors bg-black text-white placeholder:text-gray-400"
                required
              />
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
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
