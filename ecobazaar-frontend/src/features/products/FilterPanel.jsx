import { useState } from 'react';
import PropTypes from 'prop-types';
import { Leaf, AlertTriangle, XCircle } from 'lucide-react';
import { PRODUCT_CATEGORIES } from '../../utils/constants';

const FilterPanel = ({ onFilter, onReset }) => {
  const [filters, setFilters] = useState({
    category: '',
    ecoRating: '',
    minPrice: '',
    maxPrice: '',
    maxCarbon: '',
    ecoCertified: false,
  });

  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      category: '',
      ecoRating: '',
      minPrice: '',
      maxPrice: '',
      maxCarbon: '',
      ecoCertified: false,
    };
    setFilters(resetFilters);
    onReset();
  };

  const ecoRatings = [
    { value: 'ECO_FRIENDLY', label: 'Eco-Friendly', icon: <Leaf className="w-4 h-4" />, color: 'text-green-600' },
    { value: 'MODERATE', label: 'Moderate', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-yellow-600' },
    { value: 'HIGH_IMPACT', label: 'High Impact', icon: <XCircle className="w-4 h-4" />, color: 'text-red-600' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          🔍 Filters
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 transition-colors lg:hidden"
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Filter Content */}
      <div className={`space-y-4 ${!isExpanded && 'hidden lg:block'}`}>
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          >
            <option value="">All Categories</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Eco-Rating Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Eco-Rating
          </label>
          <div className="space-y-2">
            {ecoRatings.map((rating) => (
              <label key={rating.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="ecoRating"
                  value={rating.value}
                  checked={filters.ecoRating === rating.value}
                  onChange={(e) => handleFilterChange('ecoRating', e.target.value)}
                  className="w-4 h-4 text-green-500 focus:ring-green-500"
                />
                <span className={`flex items-center gap-1 text-sm ${rating.color} group-hover:font-semibold transition-all`}>
                  {rating.icon}
                  {rating.label}
                </span>
              </label>
            ))}
            {filters.ecoRating && (
              <button
                onClick={() => handleFilterChange('ecoRating', '')}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>

        {/* Eco-Certified Only */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.ecoCertified}
              onChange={(e) => handleFilterChange('ecoCertified', e.target.checked)}
              className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">
              ✓ Eco-Certified Only
            </span>
          </label>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Price Range (₹)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Max Carbon Impact */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Max Carbon Impact (kg CO₂e)
          </label>
          <input
            type="number"
            placeholder="e.g., 10"
            value={filters.maxCarbon}
            onChange={(e) => handleFilterChange('maxCarbon', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

FilterPanel.propTypes = {
  onFilter: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default FilterPanel;
