import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Leaf, Globe, CheckCircle, Truck } from 'lucide-react'
import Layout from '../components/Layout'
import Loader from '../components/Loader'
import EcoRatingBadge from '../components/EcoRatingBadge'
import { getEcoFriendlyRecommendations } from '../features/recommendations/recommendationAPI'
import { formatPrice, formatCarbonImpact, getProductImageUrl } from '../utils/helpers'

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const ecoProducts = await getEcoFriendlyRecommendations(8); // Fetch 8 eco-friendly products
      setProducts(ecoProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-linear-to-b from-green-50 to-white">

      {/* Hero Section */}
      <section 
        className="text-white py-20 bg-cover bg-no-repeat"
        style={{ backgroundImage: "url('/img_assets/main_bg.jpg')" }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
            Welcome to EcoBazaar
          </h1>
          <p className="text-xl mb-8" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
            Discover sustainable products for a better tomorrow
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition shadow-lg"
          >
            Start Shopping
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Leaf size={32} className="text-green-600" />
          <h2 className="text-3xl font-bold text-gray-800">
            Eco-Friendly Featured Products
          </h2>
        </div>
        <p className="text-center text-gray-600 mb-12">
          Handpicked sustainable products with the lowest carbon footprint
        </p>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No products available at the moment.</p>
            <Link to="/products" className="text-green-600 hover:underline mt-2 inline-block">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer"
              >
                <div className="h-40 overflow-hidden bg-gray-100 relative">
                  <img 
                    src={getProductImageUrl(product.imageUrl)} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <EcoRatingBadge ecoRating={product.ecoRating} />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <Leaf size={14} className="text-green-600" />
                    <span>{formatCarbonImpact(product.carbonImpact)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${product.id}`);
                      }}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-block px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition"
          >
            Browse All Products
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">
            Why Choose EcoBazaar?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Globe className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Eco-Friendly
              </h3>
              <p className="text-gray-600">
                All products are sustainably sourced and environmentally responsible
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Quality Assured
              </h3>
              <p className="text-gray-600">
                We guarantee the highest quality for every product
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <Truck className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Fast Shipping
              </h3>
              <p className="text-gray-600">
                Quick and reliable delivery to your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2026 EcoBazaar. All rights reserved.</p>
          <p>being developed as a part of Infosys Springboard internship</p>
        </div>
      </footer>
      </div>
    </Layout>
  )
}
