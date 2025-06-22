
import React from 'react';
import { TrendingDown, Award, Clock } from 'lucide-react';
import CabServiceCard, { CabService } from './CabServiceCard';

interface PriceComparisonProps {
  services: CabService[];
  onSelectService: (service: CabService) => void;
}

const PriceComparison = ({ services, onSelectService }: PriceComparisonProps) => {
  const cheapestPrice = Math.min(...services.map(s => s.price));
  const fastestService = services.reduce((prev, current) => {
    const prevTime = parseInt(prev.estimatedTime);
    const currentTime = parseInt(current.estimatedTime);
    return prevTime < currentTime ? prev : current;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-green-500 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-700">Best Price</p>
              <p className="text-2xl font-bold text-green-900">${cheapestPrice}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-3 rounded-full">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-700">Fastest Pickup</p>
              <p className="text-2xl font-bold text-blue-900">{fastestService.estimatedTime}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500 p-3 rounded-full">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-700">Options Found</p>
              <p className="text-2xl font-bold text-purple-900">{services.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Rides</h2>
        <p className="text-gray-600">Compare prices and choose the best option for your trip</p>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <CabServiceCard
            key={service.id}
            service={service}
            onSelect={onSelectService}
          />
        ))}
      </div>
    </div>
  );
};

export default PriceComparison;
