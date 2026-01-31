import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShoppingBag, Leaf, TrendingDown, CheckCircle, CreditCard, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { getCart } from '../features/cart/cartAPI';
import { createOrder } from '../features/orders/orderAPI';
import { formatPrice, formatCarbonImpact, getProductImageUrl } from '../utils/helpers';
import { STORAGE_KEYS, SHIPPING_CONFIG } from '../utils/constants';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);

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
      
      if (!cartData || cartData.items.length === 0) {
        toast.info('Your cart is empty!');
        navigate('/cart');
        return;
      }

      setCart(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);
      const order = await createOrder();
      setOrderId(order.id);
      setOrderComplete(true);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <Loader size="large" text="Loading checkout..." />
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mb-6">
              <CheckCircle size={80} className="mx-auto text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-2">Order #{orderId}</p>
            <p className="text-lg text-gray-700 mb-8">
              Thank you for your eco-friendly purchase! Your order has been confirmed.
            </p>

            <div className="bg-green-50 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-2 justify-center mb-3">
                <Leaf size={24} className="text-green-600" />
                <span className="font-bold text-gray-800">Environmental Impact</span>
              </div>
              <p className="text-green-700 text-lg font-semibold">
                Total Carbon Footprint: {cart.totalCarbon.toFixed(2)} kg CO₂e
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This purchase's carbon impact is tracked and will help you monitor your environmental footprint.
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/orders')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                View My Orders
              </button>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Checkout</h1>
          <p className="text-gray-600">Review your order and complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
              
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={getProductImageUrl(item.product.imageUrl, item.product.category)}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = getProductImageUrl(null, item.product.category);
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-green-600">{formatPrice(item.price * item.quantity)}</span>
                        <span className="text-sm text-gray-500">{formatCarbonImpact(item.carbonImpact * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method (Placeholder) */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
              <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
                <CreditCard size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-2">Payment Integration Coming Soon</p>
                <p className="text-sm text-gray-500">
                  For now, orders will be placed as Cash on Delivery
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
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
                {cart.totalPrice < SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD && (
                  <div className="text-xs text-blue-600 bg-blue-50 rounded p-2">
                    Add {formatPrice(SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - cart.totalPrice)} more for FREE shipping!
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-semibold">Included</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold">
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
                onClick={handlePlaceOrder}
                disabled={processing}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader size="small" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    <span>Place Order</span>
                  </>
                )}
              </button>
            </div>

            {/* Carbon Impact Summary */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <Leaf size={24} className="text-green-600" />
                <h2 className="text-xl font-bold text-gray-800">Sustainability Insights</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Carbon Footprint</div>
                  <div className="text-2xl font-bold text-green-700">
                    {cart.totalCarbon.toFixed(2)} kg CO₂e
                  </div>
                </div>

                <div className="bg-white/50 rounded-lg p-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown size={16} />
                    <span className="font-semibold">Environmental Impact</span>
                  </div>
                  <div className="space-y-1">
                    <div>≈ {(cart.totalCarbon * 4.5).toFixed(1)} km of driving</div>
                    <div>≈ {Math.ceil(cart.totalCarbon / 21)} tree{Math.ceil(cart.totalCarbon / 21) > 1 ? 's' : ''} needed to offset (1 year)</div>
                    <div className="flex items-center gap-2">
                      {cart.totalCarbon < 10 
                        ? <><Leaf className="w-4 h-4 text-green-600" /> Great choice! Low carbon impact</>
                        : cart.totalCarbon < 20
                        ? <><AlertTriangle className="w-4 h-4 text-yellow-600" /> Moderate carbon impact</>
                        : <><XCircle className="w-4 h-4 text-red-600" /> High carbon impact - consider alternatives</>}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-600 bg-white/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    <p>Did you know?</p>
                  </div>
                  <p>
                    By shopping with EcoBazaar, you're making informed choices about your environmental impact.
                    Every purchase helps track and reduce your carbon footprint!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
