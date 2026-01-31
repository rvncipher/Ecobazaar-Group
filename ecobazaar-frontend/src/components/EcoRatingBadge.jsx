import PropTypes from 'prop-types';
import { Leaf, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { getEcoRatingConfig } from '../utils/helpers';

const iconMap = {
  Leaf: Leaf,
  AlertTriangle: AlertTriangle,
  XCircle: XCircle,
  HelpCircle: HelpCircle,
};

const EcoRatingBadge = ({ ecoRating, showDescription = false }) => {
  const config = getEcoRatingConfig(ecoRating);
  const IconComponent = iconMap[config.iconName] || HelpCircle;

  return (
    <div className="inline-block">
      <div 
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 font-semibold text-sm uppercase tracking-wide transition-all hover:scale-105 hover:shadow-md"
        style={{ 
          backgroundColor: config.bgColor,
          color: config.color,
          borderColor: config.color,
        }}
      >
        <IconComponent className="w-4 h-4" />
        <span className="font-semibold">{config.label}</span>
      </div>
      
      {showDescription && (
        <p className="mt-2 text-sm text-gray-500 italic">
          {config.description || 'No description available'}
        </p>
      )}
    </div>
  );
};

EcoRatingBadge.propTypes = {
  ecoRating: PropTypes.string.isRequired,
  showDescription: PropTypes.bool,
};

export default EcoRatingBadge;
