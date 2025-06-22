
import React from 'react';
import { Star, Gift } from 'lucide-react';

interface PointsBarProps {
  points: number;
  userEmail: string;
}

const PointsBar = ({ points, userEmail }: PointsBarProps) => {
  return (
    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black py-3 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="bg-black rounded-full p-2">
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <span className="font-semibold">{points.toLocaleString()} Points</span>
          </div>
          <div className="hidden md:block text-sm opacity-80">
            Welcome back, {userEmail.split('@')[0]}!
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Gift className="h-4 w-4" />
          <span className="text-sm font-medium">Redeem Rewards</span>
        </div>
      </div>
    </div>
  );
};

export default PointsBar;
