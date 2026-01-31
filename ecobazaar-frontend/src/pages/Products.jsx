import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SearchBar from '../features/products/SearchBar';
import FilterPanel from '../features/products/FilterPanel';
import ProductList from '../features/products/ProductList';
import { Leaf } from 'lucide-react';
import { 
  getApprovedProducts, 
  searchProducts, 
  getProductsByCategory,
  getProductsByEcoRating,
  getEcoCertifiedProducts,
} from '../features/products/productAPI';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  // Fetch initial products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getApprovedProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (keyword) => {
    setSearchTerm(keyword);
    
    if (!keyword.trim()) {
      // If search is cleared, re-apply existing filters
      applyFilters(activeFilters, '');
      return;
    }

    // Apply search with existing filters
    applyFilters(activeFilters, keyword);
  };

  // Handle filters
  const handleFilter = (filters) => {
    setActiveFilters(filters);
    applyFilters(filters, searchTerm);
  };

  const applyFilters = (filters, currentSearchTerm = '') => {
    let filtered = [...products];

    // Apply search filter first if search term exists
    if (currentSearchTerm && currentSearchTerm.trim()) {
      const searchLower = currentSearchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // Eco-rating filter
    if (filters.ecoRating) {
      filtered = filtered.filter(p => p.ecoRating === filters.ecoRating);
    }

    // Eco-certified filter
    if (filters.ecoCertified) {
      filtered = filtered.filter(p => p.ecoCertified === true);
    }

    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice));
    }

    // Max carbon filter
    if (filters.maxCarbon) {
      filtered = filtered.filter(p => p.carbonImpact <= parseFloat(filters.maxCarbon));
    }

    setFilteredProducts(filtered);
  };

  // Reset filters
  const handleResetFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setFilteredProducts(products);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />
      
      {/* Header with Animated Leaves */}
      <div className="bg-linear-to-r from-green-600 via-green-500 to-emerald-500 text-white py-16 relative overflow-hidden">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black opacity-5"></div>
        
        {/* Animated Leaves */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-leaf opacity-0"
              style={{
                left: `${5 + (i * 12)}%`,
                top: `-${20 + i * 10}px`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${12 + (i % 3) * 2}s`,
              }}
            >
              <Leaf 
                className="text-white"
                size={40 + (i % 3) * 8}
                style={{
                  transform: `rotate(${i * 45}deg)`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-3 drop-shadow-lg">Eco-Friendly Products</h1>
            <p className="text-green-50 text-xl leading-relaxed">
              Discover sustainable products with transparent carbon footprint data
            </p>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} placeholder="Search eco-friendly products..." />
        </div>

        {/* Layout: Sidebar + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-1">
            <FilterPanel onFilter={handleFilter} onReset={handleResetFilters} />
          </aside>

          {/* Products List */}
          <main className="lg:col-span-3">
            <ProductList
              products={filteredProducts}
              loading={loading}
              emptyMessage="No products match your criteria"
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
