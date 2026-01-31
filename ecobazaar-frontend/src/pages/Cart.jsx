import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Trash2, Plus, Minus, ShoppingBag, Leaf, TrendingDown, AlertCircle, Truck, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { getCart, updateCartItem, removeCartItem, clearCart } from '../features/cart/cartAPI';
import { getGreenerAlternatives } from '../features/recommendations/recommendationAPI';
import { formatPrice, formatCarbonImpact, getProductImageUrl } from '../utils/helpers';
import { STORAGE_KEYS, SHIPPING_CONFIG } from '../utils/constants';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      navigate('/login');
      return;
    }

    fetchCart();
  }, [navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const cartData = await getCart();
      setCart(cartData);

      // Fetch recommendations for high-impact items
      if (cartData.items && cartData.items.length > 0) {
        await fetchRecommendations(cartData.items);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (cartItems) => {
    try {
      const recs = [];
      for (const item of cartItems) {
        // Only fetch alternatives for moderate/high impact products
        if (item.product.ecoRating !== 'ECO_FRIENDLY') {
          try {
            const alternatives = await getGreenerAlternatives(item.product.id);
            if (alternatives.length > 0) {
              recs.push({
                cartItem: item,
                alternatives: alternatives.slice(0, 2), // Show top 2 alternatives
              });
            }
          } catch (err) {
            console.error('Error fetching alternatives:', err);
          }
        }
      }
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    try {
      setUpdating(true);
      const updatedCart = await updateCartItem(cartItemId, newQuantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    if (!window.confirm('Remove this item from cart?')) return;

    try {
      setUpdating(true);
      const updatedCart = await removeCartItem(cartItemId);
      setCart(updatedCart);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Clear all items from cart?')) return;

    try {
      setUpdating(true);
      const updatedCart = await clearCart();
      setCart(updatedCart);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.info('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <Loader size="large" text="Loading cart..." />
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {isEmpty ? 'Your cart is empty' : `${cart.totalItems} item${cart.totalItems > 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {isEmpty ? (
          /* Empty Cart State */
          <div className="bg-white rounded-2xl shadow-md p-16 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Add some eco-friendly products to get started!</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div 
                      className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/products/${item.product.id}`)}
                    >
                      <img
                        src={getProductImageUrl(item.product.imageUrl, item.product.category)}
                        alt={item.product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = getProductImageUrl(null, item.product.category);
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 
                            className="text-lg font-bold text-gray-800 cursor-pointer hover:text-green-600"
                            onClick={() => navigate(`/products/${item.product.id}`)}
                          >
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500">{item.product.category}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updating}
                          className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-2xl font-bold text-green-600">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatCarbonImpact(item.carbonImpact)} per unit
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={updating || item.quantity <= 1}
                            className="w-8 h-8 rounded-md border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition"
                          >
                            <Minus size={16} className="mx-auto" />
                          </button>
                          <span className="text-lg font-semibold text-gray-800 min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={updating || item.quantity >= item.product.stock}
                            className="w-8 h-8 rounded-md border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition"
                          >
                            <Plus size={16} className="mx-auto" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-800">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatCarbonImpact(item.carbonImpact * item.quantity)} total
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <button
                onClick={handleClearCart}
                disabled={updating}
                className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
              >
                Clear Cart
              </button>
            </div>

            {/* Cart Summary */}
            <div className="space-y-6">
              {/* Free Shipping Progress */}
              {cart.totalPrice < SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md p-5 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck size={20} className="text-blue-600" />
                    <h3 className="font-bold text-gray-800">Free Shipping Progress</h3>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Add {formatPrice(SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - cart.totalPrice)} more for FREE delivery!</span>
                      <span className="font-semibold">{formatPrice(cart.totalPrice)} / {formatPrice(SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD)}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((cart.totalPrice / SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Leaf size={14} className="text-green-600" />
                    Free shipping helps reduce multiple deliveries - better for the planet!
                  </p>
                </div>
              )}

              {cart.totalPrice >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-md p-5 border border-green-200">
                  <div className="flex items-center gap-2 text-green-700">
                    <Sparkles size={20} className="text-green-600" />
                    <span className="font-bold">You've unlocked FREE Shipping!</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                    <Leaf size={14} className="text-green-600" />
                    Consolidated delivery reduces carbon emissions
                  </p>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.totalItems} items)</span>
                    <span className="font-semibold">{formatPrice(cart.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    {cart.totalPrice >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD ? (
                      <span className="font-semibold text-green-600">FREE</span>
                    ) : (
                      <span className="font-semibold">{formatPrice(SHIPPING_CONFIG.SHIPPING_CHARGE)}</span>
                    )}
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">
                      {formatPrice(
                        cart.totalPrice >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD 
                          ? cart.totalPrice 
                          : cart.totalPrice + SHIPPING_CONFIG.SHIPPING_CHARGE
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={updating}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition"
                >
                  Proceed to Checkout
                </button>
              </div>

              {/* Carbon Summary */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf size={24} className="text-green-600" />
                  <h2 className="text-xl font-bold text-gray-800">Carbon Summary</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total CO₂ Emissions</span>
                    <span className="text-2xl font-bold text-green-700">
                      {cart.totalCarbon.toFixed(2)} kg
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 bg-white/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown size={16} />
                      <span className="font-semibold">Environmental Impact</span>
                    </div>
                    <div className="space-y-1">
                      <div>≈ {(cart.totalCarbon * 4.5).toFixed(1)} km driving</div>
                      <div>≈ {Math.ceil(cart.totalCarbon / 21)} tree{Math.ceil(cart.totalCarbon / 21) > 1 ? 's' : ''} needed (1 year)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Green Recommendations */}
              {recommendations.length > 0 && showRecommendations && (
                <div className="bg-yellow-50 rounded-xl shadow-md p-6 border border-yellow-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={20} className="text-yellow-600" />
                      <h3 className="font-bold text-gray-800">Greener Alternatives</h3>
                    </div>
                    <button
                      onClick={() => setShowRecommendations(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Consider these eco-friendlier options to reduce your carbon footprint!
                  </p>

                  <div className="space-y-3">
                    {recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-3">
                        <div className="text-sm font-semibold text-gray-700 mb-2">
                          Instead of: {rec.cartItem.product.name}
                        </div>
                        {rec.alternatives.map((alt) => (
                          <div 
                            key={alt.id}
                            onClick={() => navigate(`/products/${alt.id}`)}
                            className="text-sm text-green-600 hover:text-green-700 cursor-pointer flex justify-between items-center py-1"
                          >
                            <span>→ {alt.name}</span>
                            <span className="text-xs">
                              Save {(rec.cartItem.carbonImpact - alt.carbonImpact).toFixed(2)} kg CO₂
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
