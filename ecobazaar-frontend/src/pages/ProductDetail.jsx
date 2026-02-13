import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShoppingCart, ArrowLeft, Package, Leaf, TrendingDown, Award, Sparkles, GitCompare, Frown } from 'lucide-react';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import CarbonBadge from '../components/CarbonBadge';
import EcoRatingBadge from '../components/EcoRatingBadge';
import { getProductById, getApprovedProducts } from '../features/products/productAPI';
import { getGreenerAlternatives, getSimilarProducts } from '../features/recommendations/recommendationAPI';
import { addToCart } from '../features/cart/cartAPI';
import { formatPrice, formatCarbonImpact, getProductImageUrl } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [greenerAlternatives, setGreenerAlternatives] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch product details
      const productData = await getProductById(id);
      setProduct(productData);

      // Fetch greener alternatives (if not already eco-friendly)
      if (productData.ecoRating !== 'ECO_FRIENDLY') {
        try {
          const alternatives = await getGreenerAlternatives(id);
          setGreenerAlternatives(alternatives.slice(0, 4));
        } catch (err) {
          console.error('Error fetching greener alternatives:', err);
        }
      }

      // Fetch similar products
      try {
        const similar = await getSimilarProducts(id, 4);
        setSimilarProducts(similar);
      } catch (err) {
        console.error('Error fetching similar products:', err);
      }

      // Fallback: Fetch related products (same category)
      const allProducts = await getApprovedProducts();
      const related = allProducts
        .filter(p => p.category === productData.category && p.id !== productData.id)
        .slice(0, 4);
      setRelatedProducts(related);

    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details. The product may not exist or is not approved yet.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    // Check if user is logged in
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      toast.warning('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(product.id, quantity);
      toast.success(`Added ${quantity} x ${product.name} to cart!`);
      setQuantity(1); // Reset quantity
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 403) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        navigate('/login');
      } else if (error.response?.status === 401) {
        toast.warning('Please login to add items to cart');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.error || 'Failed to add to cart');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const calculateTotalCarbon = () => {
    return (product.carbonImpact * quantity).toFixed(2);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <Loader size="large" text="Loading product details..." />
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Frown className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-8">{error || 'The product you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Browse All Products
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const imageUrl = imageError 
    ? getProductImageUrl(null, product.category) 
    : getProductImageUrl(product.imageUrl, product.category);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition"
        >
          <ArrowLeft size={18} />
          <span className="font-medium text-sm">Back</span>
        </button>

        {/* Product Details Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>

              {/* Eco-Certified Badge */}
              {product.ecoCertified && (
                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-lg">
                  <Award size={16} />
                  <span>Eco-Certified</span>
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="flex flex-col gap-3">
              {/* Category */}
              <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                {product.category}
              </div>

              {/* Product Name */}
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Eco Rating */}
              <div>
                <EcoRatingBadge ecoRating={product.ecoRating} />
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed text-sm">
                {product.description || 'No description available for this product.'}
              </p>

              {/* Price */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <div className="text-xs text-gray-600 mb-1">Price</div>
                <div className="text-xl font-extrabold text-green-600">
                  {formatPrice(product.price)}
                </div>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <Package size={18} className={product.stock > 0 ? 'text-green-600' : 'text-red-600'} />
                <span className={`font-medium text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} units in stock` : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base transition"
                    >
                      −
                    </button>
                    <span className="text-base font-semibold w-10 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="w-8 h-8 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                {addingToCart ? 'Adding to Cart...' : (product.stock > 0 ? 'Add to Cart' : 'Out of Stock')}
              </button>

              {product.stock > 0 && (
                <p className="text-sm text-gray-500 text-center">
                  Total: {formatPrice(product.price * quantity)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Carbon Footprint Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Leaf size={20} className="text-green-600" />
            <h2 className="text-lg font-bold text-gray-800">Carbon Footprint Analysis</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Per Unit Carbon Impact */}
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="text-xs text-gray-600 mb-1">Per Unit Impact</div>
              <div className="text-lg font-bold text-green-700 mb-2">
                {formatCarbonImpact(product.carbonImpact)}
              </div>
              <CarbonBadge 
                carbonImpact={product.carbonImpact} 
                ecoRating={product.ecoRating} 
                size="small" 
              />
            </div>

            {/* Total Carbon for Selected Quantity */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="text-xs text-gray-600 mb-1">Total for {quantity} unit{quantity > 1 ? 's' : ''}</div>
              <div className="text-lg font-bold text-blue-700 mb-2">
                {calculateTotalCarbon()} kg CO₂e
              </div>
              <div className="text-xs text-gray-600">
                {quantity} × {product.carbonImpact.toFixed(2)} kg
              </div>
            </div>

            {/* Eco Rating */}
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="text-xs text-gray-600 mb-1">Sustainability Rating</div>
              <div className="text-lg font-bold text-purple-700 mb-2">
                {product.ecoRating.replace('_', ' ')}
              </div>
              {product.ecoCertified && (
                <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                  <Award size={14} />
                  <span>Certified</span>
                </div>
              )}
            </div>
          </div>

          {/* Carbon Comparison */}
          <div className="mt-4 bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={16} className="text-gray-700" />
              <h3 className="font-bold text-gray-800 text-sm">Environmental Impact</h3>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Compared to conventional alternatives:</span>
                <span className="font-semibold text-green-600">
                  {product.carbonImpact < 5 ? '↓ 30-50% lower emissions' : 
                   product.carbonImpact < 10 ? '≈ Similar emissions' : 
                   '↑ Higher emissions - consider alternatives'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Equivalent to driving:</span>
                <span className="font-semibold text-gray-700">
                  {(product.carbonImpact * quantity * 4.5).toFixed(1)} km in a car
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Trees needed to offset:</span>
                <span className="font-semibold text-gray-700">
                  {Math.ceil(product.carbonImpact * quantity / 21)} tree{Math.ceil(product.carbonImpact * quantity / 21) > 1 ? 's' : ''} (1 year)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Greener Alternatives Section */}
        {greenerAlternatives.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-4 mb-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Leaf size={20} className="text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">Greener Alternatives</h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Consider these eco-friendlier options with lower carbon footprint in the same category!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {greenerAlternatives.map((alt) => {
                const carbonSavings = (product.carbonImpact - alt.carbonImpact).toFixed(2);
                const savingsPercent = ((carbonSavings / product.carbonImpact) * 100).toFixed(0);
                return (
                  <div
                    key={alt.id}
                    onClick={() => navigate(`/products/${alt.id}`)}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-green-300"
                  >
                    <div className="h-32 bg-gray-100 relative">
                      <img
                        src={getProductImageUrl(alt.imageUrl, alt.category)}
                        alt={alt.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = getProductImageUrl(null, alt.category);
                        }}
                      />
                      <div className="absolute top-1 right-1">
                        <EcoRatingBadge ecoRating={alt.ecoRating} />
                      </div>
                    </div>
                    <div className="p-2.5">
                      <h3 className="font-bold text-gray-800 text-xs mb-1.5 line-clamp-2">
                        {alt.name}
                      </h3>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-bold text-green-600">
                          {formatPrice(alt.price)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatCarbonImpact(alt.carbonImpact)}
                        </span>
                      </div>
                      <div className="bg-green-100 border border-green-300 rounded-lg p-1.5 text-center">
                        <div className="text-xs font-semibold text-green-700">
                          Save {carbonSavings} kg CO₂
                        </div>
                        <div className="text-xs text-green-600">
                          ({savingsPercent}% less impact)
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <GitCompare size={20} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-800">Similar Products</h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Products in a similar price range and category
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {similarProducts.map((similar) => (
                <div
                  key={similar.id}
                  onClick={() => navigate(`/products/${similar.id}`)}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden border border-gray-200"
                >
                  <div className="h-32 bg-gray-100 relative">
                    <img
                      src={getProductImageUrl(similar.imageUrl, similar.category)}
                      alt={similar.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = getProductImageUrl(null, similar.category);
                      }}
                    />
                    <div className="absolute top-1 right-1">
                      <EcoRatingBadge ecoRating={similar.ecoRating} />
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-bold text-gray-800 text-xs mb-1.5 line-clamp-2">
                      {similar.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-green-600">
                        {formatPrice(similar.price)}
                      </span>
                      <CarbonBadge 
                        carbonImpact={similar.carbonImpact} 
                        ecoRating={similar.ecoRating}
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  onClick={() => navigate(`/products/${relatedProduct.id}`)}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                >
                  <div className="h-40 bg-gray-100">
                    <img
                      src={getProductImageUrl(relatedProduct.imageUrl, relatedProduct.category)}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = getProductImageUrl(null, relatedProduct.category);
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(relatedProduct.price)}
                      </span>
                      <CarbonBadge 
                        carbonImpact={relatedProduct.carbonImpact} 
                        ecoRating={relatedProduct.ecoRating}
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
