
import React, { useState } from 'react';
import { Car, Zap, Shield, Clock } from 'lucide-react';
import SearchForm, { SearchData } from '../components/SearchForm';
import PriceComparison from '../components/PriceComparison';
import { CabService } from '../components/CabServiceCard';
import { mockCabServices } from '../data/mockServices';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [searchResults, setSearchResults] = useState<CabService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchData: SearchData) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSearchResults(mockCabServices);
      setHasSearched(true);
      setIsLoading(false);
      toast({
        title: "Search Complete!",
        description: `Found ${mockCabServices.length} available rides for your trip.`,
      });
    }, 1500);
  };

  const handleSelectService = (service: CabService) => {
    toast({
      title: "Booking Redirect",
      description: `Redirecting to ${service.name} booking page...`,
    });
    console.log('Selected service:', service);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-2xl">
                <Car className="h-12 w-12 text-black" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Compare <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">Cab Prices</span>
              <br />
              in Seconds
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Find the best deals on rides from all major cab services. Save time and money with our instant price comparison.
            </p>
          </div>

          {/* Search Form */}
          <div className="mb-16">
            <SearchForm onSearch={handleSearch} />
          </div>

          {/* Features */}
          {!hasSearched && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="bg-yellow-400 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Instant Results</h3>
                <p className="text-gray-300">Get real-time prices from all major cab services in one search.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-400 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Best Prices</h3>
                <p className="text-gray-300">Compare prices and find the most affordable option for your trip.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-400 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Save Time</h3>
                <p className="text-gray-300">No need to check multiple apps. We do the comparison for you.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-white mb-2">Searching for the best rides...</h2>
            <p className="text-gray-300">Comparing prices from all available services</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && !isLoading && searchResults.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <PriceComparison 
            services={searchResults} 
            onSelectService={handleSelectService}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
