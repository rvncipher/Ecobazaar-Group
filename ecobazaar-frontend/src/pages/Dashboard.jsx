import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Leaf, User, LogOut, Globe, CheckCircle, Truck } from 'lucide-react'
import Navbar from '../components/Navbar'
import { STORAGE_KEYS } from '../utils/constants'

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const email = localStorage.getItem('userEmail')
    const name = localStorage.getItem('userName')
    
    if (!token || !email) {
      navigate('/login')
      return
    }
    
    setUserEmail(email)
    setUserName(name || email)
  }, [navigate])

  const handleLogout = () => {
    // Clear new STORAGE_KEYS
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    // Clear old keys for backward compatibility
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEcoScore')
    localStorage.removeItem('userVerified')
    navigate('/')
  }

  const getUserInitial = () => {
    if (userName && userName.length > 0 && userName !== userEmail) {
      return userName.charAt(0).toUpperCase()
    }
    if (userEmail && userEmail.length > 0) {
      return userEmail.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const products = [
    {
      id: 1,
      name: 'Organic Cotton T-Shirt',
      price: '₹2,499',
      image: '/img_assets/Tshirt.jpg',
      description: 'Sustainable and comfortable',
    },
    {
      id: 2,
      name: 'Bamboo Toothbrush Set',
      price: '₹999',
      image: '/img_assets/bambbrush.jpg',
      description: 'Eco-friendly dental care',
    },
    {
      id: 3,
      name: 'Reusable Water Bottle',
      price: '₹3,299',
      image: '/img_assets/bottle.jpg',
      description: 'Stainless steel construction',
    },
    {
      id: 4,
      name: 'Bamboo Cutting Board',
      price: '₹1,999',
      image: '/img_assets/cuttinboard.jpg',
      description: 'Perfect for your kitchen',
    },
  ]

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white">
      {/* Navigation Bar */}
      <Navbar />

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">
          Featured Products
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
            >
              <div className="h-48 overflow-hidden bg-gray-100">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    {product.price}
                  </span>
                  <button className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition">
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
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
        </div>
      </footer>
    </div>
  )
}
