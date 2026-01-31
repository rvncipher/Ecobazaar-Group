import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import CarbonBadge from '../../components/CarbonBadge';
import EcoRatingBadge from '../../components/EcoRatingBadge';
import { formatPrice, truncateText, getProductImageUrl } from '../../utils/helpers';

const ProductCard = ({ product, showActions = false, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit && onEdit(product);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete && onDelete(product);
  };

  const imageUrl = imageError 
    ? getProductImageUrl(null, product.category) 
    : getProductImageUrl(product.imageUrl, product.category);

  return (
    <div 
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
      onClick={handleCardClick}
    >
      {/* Product Image */}
      <div className="relative w-full h-40 overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={handleImageError}
        />
        
        {/* Eco-Certified Badge */}
        {product.ecoCertified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-md">
            <span className="bg-white text-green-500 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[0.6rem] font-black">✓</span>
            Certified
          </div>
        )}
        
        {/* Approval Status (for seller view) */}
        {showActions && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-bold shadow-md ${
            product.approved ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
          }`}>
            {product.approved ? '✓ Approved' : '⏳ Pending'}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Category & Eco Rating in one line */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
            {product.category}
          </span>
          <EcoRatingBadge ecoRating={product.ecoRating} />
        </div>

        {/* Product Name */}
        <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
          {truncateText(product.description, 60)}
        </p>

        {/* Carbon Badge */}
        <div className="flex justify-start">
          <CarbonBadge
            carbonImpact={product.carbonImpact}
            ecoRating={product.ecoRating}
            size="small"
          />
        </div>

        {/* Price & Stock */}
        <div className="flex justify-between items-end pt-2 border-t border-gray-200 mt-auto">
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-green-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Action Buttons for Seller */}
          {showActions && (
            <div className="flex gap-2">
              <button
                className="p-1.5 rounded-md text-lg transition-all hover:scale-110 hover:bg-blue-50"
                onClick={handleEdit}
                title="Edit Product"
              >
                ✏️
              </button>
              <button
                className="p-1.5 rounded-md text-lg transition-all hover:scale-110 hover:bg-red-50"
                onClick={handleDelete}
                title="Delete Product"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    stock: PropTypes.number,
    carbonImpact: PropTypes.number.isRequired,
    ecoRating: PropTypes.string.isRequired,
    ecoCertified: PropTypes.bool,
    approved: PropTypes.bool,
    imageUrl: PropTypes.string,
  }).isRequired,
  showActions: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default ProductCard;
