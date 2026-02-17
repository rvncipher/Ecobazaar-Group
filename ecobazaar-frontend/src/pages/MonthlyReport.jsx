import { useState, useEffect, useRef } from 'react';
import { TrendingUp, ShoppingBag, Award, Sparkles, PieChart, DollarSign, Download, Leaf, Wand2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import MonthSelector from '../components/MonthSelector';
import CategoryPurchaseChart from '../components/CategoryPurchaseChart';
import CarbonImpactSummary from '../components/CarbonImpactSummary';
import SpendingSummary from '../components/SpendingSummary';
import { getUserPurchaseReport, generateAISummary } from '../services/reportAPI';
import { STORAGE_KEYS } from '../utils/constants';

export default function MonthlyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [isAICached, setIsAICached] = useState(false);
  const reportRef = useRef(null);

  // AI Report Cache Management
  const AI_CACHE_KEY = 'ecobazaar_ai_reports';
  const MAX_CACHED_REPORTS = 2;

  const getAICacheKey = (userId, month) => `${userId}_${month}`;

  const loadCachedAIReport = (userId, month) => {
    try {
      const cacheStr = localStorage.getItem(AI_CACHE_KEY);
      if (!cacheStr) return null;

      const cache = JSON.parse(cacheStr);
      const key = getAICacheKey(userId, month);
      
      return cache[key] || null;
    } catch (err) {
      console.error('Error loading cached AI report:', err);
      return null;
    }
  };

  const saveCachedAIReport = (userId, month, summary) => {
    try {
      const cacheStr = localStorage.getItem(AI_CACHE_KEY);
      let cache = cacheStr ? JSON.parse(cacheStr) : {};

      const key = getAICacheKey(userId, month);
      
      // Add new report with timestamp
      cache[key] = {
        summary,
        timestamp: Date.now(),
        userId,
        month
      };

      // Keep only the last MAX_CACHED_REPORTS reports
      const entries = Object.entries(cache)
        .sort((a, b) => b[1].timestamp - a[1].timestamp)
        .slice(0, MAX_CACHED_REPORTS);

      cache = Object.fromEntries(entries);

      localStorage.setItem(AI_CACHE_KEY, JSON.stringify(cache));
    } catch (err) {
      console.error('Error saving cached AI report:', err);
    }
  };

  const clearOldAICache = () => {
    try {
      const cacheStr = localStorage.getItem(AI_CACHE_KEY);
      if (!cacheStr) return;

      const cache = JSON.parse(cacheStr);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

      // Remove entries older than 30 days
      const filteredCache = Object.fromEntries(
        Object.entries(cache).filter(([_, value]) => value.timestamp > thirtyDaysAgo)
      );

      localStorage.setItem(AI_CACHE_KEY, JSON.stringify(filteredCache));
    } catch (err) {
      console.error('Error clearing old AI cache:', err);
    }
  };

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    // Set default month and clear old cache on mount
    const currentMonth = getCurrentMonth();
    setSelectedMonth(currentMonth);
    clearOldAICache();
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      if (!selectedMonth) return;
      
      try {
        setLoading(true);
        setError(null);

        // Get user ID from localStorage
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?.id || localStorage.getItem('userId');

        if (!userId) {
          throw new Error('User not logged in. Please login again.');
        }

        const data = await getUserPurchaseReport(userId, selectedMonth);
        setReport(data);

        // Try to load cached AI report for this month
        const cachedReport = loadCachedAIReport(userId, selectedMonth);
        if (cachedReport) {
          setAiSummary(cachedReport.summary);
          setAiError(null);
          setIsAICached(true);
        } else {
          setAiSummary('');
          setIsAICached(false);
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [selectedMonth]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    // AI summary will be loaded from cache in useEffect if available
  };

  const handleGenerateAISummary = async () => {
    if (!report) return;

    try {
      setLoadingAI(true);
      setAiError(null);

      // Get user ID from localStorage
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.id || localStorage.getItem('userId');

      if (!userId) {
        throw new Error('User not logged in.');
      }

      const response = await generateAISummary(userId, selectedMonth);
      
      if (response.status === 'success') {
        setAiSummary(response.summary);
        setIsAICached(false); // Mark as freshly generated
        // Save to cache for future use
        saveCachedAIReport(userId, selectedMonth, response.summary);
      } else {
        setAiError(response.error || 'Failed to generate AI summary');
      }
    } catch (err) {
      console.error('Error generating AI summary:', err);
      setAiError(err.response?.data?.message || err.message || 'Failed to generate AI summary');
    } finally {
      setLoadingAI(false);
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current || !report) return;

    try {
      setGeneratingPDF(true);

      // Wait a bit to ensure all charts are fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the report content element
      const element = reportRef.current;
      
      // Create a temporary style element to override oklch colors and add proper spacing
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        body * {
          color: rgb(0, 0, 0) !important;
          background-color: rgb(255, 255, 255) !important;
          box-sizing: border-box !important;
        }
        .bg-white { background-color: rgb(255, 255, 255) !important; }
        .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
        .bg-blue-50 { background-color: rgb(239, 246, 255) !important; }
        .bg-blue-100 { background-color: rgb(219, 234, 254) !important; }
        .bg-green-50 { background-color: rgb(240, 253, 244) !important; }
        .bg-red-50 { background-color: rgb(254, 242, 242) !important; }
        .bg-purple-50 { background-color: rgb(250, 245, 255) !important; }
        .bg-purple-100 { background-color: rgb(243, 232, 255) !important; }
        .text-gray-500 { color: rgb(107, 114, 128) !important; }
        .text-gray-600 { color: rgb(75, 85, 99) !important; }
        .text-gray-700 { color: rgb(55, 65, 81) !important; }
        .text-gray-800 { color: rgb(31, 41, 55) !important; }
        .text-gray-900 { color: rgb(17, 24, 39) !important; }
        .text-blue-600 { color: rgb(37, 99, 235) !important; }
        .text-blue-700 { color: rgb(29, 78, 216) !important; }
        .text-blue-800 { color: rgb(30, 64, 175) !important; }
        .text-green-600 { color: rgb(22, 163, 74) !important; }
        .text-green-700 { color: rgb(21, 128, 61) !important; }
        .text-red-600 { color: rgb(220, 38, 38) !important; }
        .text-red-700 { color: rgb(185, 28, 28) !important; }
        .text-yellow-600 { color: rgb(202, 138, 4) !important; }
        .text-purple-600 { color: rgb(147, 51, 234) !important; }
        .text-purple-700 { color: rgb(126, 34, 206) !important; }
        .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
        .border-blue-200 { border-color: rgb(191, 219, 254) !important; }
        .border-green-200 { border-color: rgb(187, 247, 208) !important; }
        .border-red-200 { border-color: rgb(254, 202, 202) !important; }
        .border-purple-200 { border-color: rgb(233, 213, 255) !important; }
        .divide-gray-200 > * { border-color: rgb(229, 231, 235) !important; }
        
        /* Override gradient backgrounds with solid colors for PDF compatibility */
        .bg-gradient-to-br,
        .bg-gradient-to-r,
        .bg-gradient-to-l,
        .bg-gradient-to-t,
        .bg-gradient-to-b {
          background-image: none !important;
          background: rgb(250, 245, 255) !important;
        }
        .from-purple-50.to-blue-50 {
          background: rgb(245, 243, 255) !important;
        }
        .from-purple-600.to-blue-600 {
          background: rgb(147, 51, 234) !important;
        }
        .from-purple-700.to-blue-700 {
          background: rgb(126, 34, 206) !important;
        }
        .bg-white\/50 {
          background-color: rgb(255, 255, 255) !important;
          opacity: 0.9 !important;
        }
        
        /* Add padding and spacing for better PDF rendering */
        table { width: 100% !important; border-collapse: collapse !important; }
        th, td { 
          padding: 12px !important; 
          text-align: left !important;
          border: 1px solid rgb(229, 231, 235) !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        .shadow-md, .rounded-lg { 
          box-shadow: none !important;
          border: 1px solid rgb(229, 231, 235) !important;
          padding: 20px !important;
          margin-bottom: 20px !important;
        }
        h1, h2, h3, h4, h5, h6 {
          margin-bottom: 15px !important;
          margin-top: 10px !important;
          line-height: 1.5 !important;
        }
        p {
          margin-bottom: 10px !important;
          line-height: 1.4 !important;
        }
        .grid {
          display: grid !important;
          gap: 20px !important;
        }
        canvas {
          max-width: 100% !important;
          height: auto !important;
        }
        /* Fix for chart legend items - ensure they don't get cut */
        .grid.grid-cols-2 {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
          margin-top: 12px !important;
        }
        .grid.grid-cols-2 > div {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 4px !important;
          white-space: normal !important;
          overflow: visible !important;
        }
        .grid.grid-cols-2 span {
          white-space: normal !important;
          overflow: visible !important;
          text-overflow: clip !important;
          word-break: break-word !important;
          line-height: 1.3 !important;
          font-size: 11px !important;
        }
        .truncate {
          white-space: normal !important;
          overflow: visible !important;
          text-overflow: clip !important;
        }
      `;
      document.head.appendChild(style);
      
      // Wait for styles to be applied before rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Configure html2canvas options for better quality
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality for better text rendering
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      });

      // Remove the temporary style
      document.head.removeChild(style);

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calculate PDF dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions with proper margins
      const margin = 15; // Increased margin
      const availableWidth = pdfWidth - (2 * margin);
      const availableHeight = pdfHeight - (2 * margin);
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Scale to fit width
      const scale = availableWidth / imgWidth;
      const scaledWidth = availableWidth;
      const scaledHeight = imgHeight * scale;
      
      // Calculate number of pages needed
      const totalPages = Math.ceil(scaledHeight / availableHeight);

      // Add pages
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // Calculate the portion of the image for this page
        const sourceY = (page * availableHeight) / scale;
        const sourceHeight = Math.min(availableHeight / scale, imgHeight - sourceY);
        
        // Create a temporary canvas for this page's content
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        // Draw the relevant portion of the original canvas
        pageCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
        
        const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
        
        // Add image to PDF
        pdf.addImage(
          pageImgData,
          'PNG',
          margin,
          margin,
          scaledWidth,
          sourceHeight * scale
        );
      }

      // Generate filename with month
      const filename = `EcoBazaar_Report_${selectedMonth}.pdf`;
      pdf.save(filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', error.message, error.stack);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}. Check console for details.`);
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <Loader />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Purchase Report
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into your purchases, spending, and environmental impact
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex justify-between items-center mb-8">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
          
          {report && !loading && (
            <button
              onClick={generatePDF}
              disabled={generatingPDF}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                generatingPDF
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              <Download size={20} />
              {generatingPDF ? 'Generating PDF...' : 'Download PDF'}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {report && (
          <div ref={reportRef}>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Orders */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingBag className="text-blue-600" size={32} />
                </div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-800">
                  {report.totalOrders || 0}
                </p>
              </div>

              {/* Items Bought */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="text-purple-600" size={32} />
                </div>
                <p className="text-gray-600 text-sm">Items Bought</p>
                <p className="text-3xl font-bold text-gray-800">
                  {report.totalItemsBought || 0}
                </p>
              </div>

              {/* Total Spent */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="text-red-600" size={32} />
                </div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-gray-800">
                  ₹{parseFloat(report.totalSpent || 0).toFixed(2)}
                </p>
              </div>

              {/* Carbon Emitted */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <Award className="text-yellow-600" size={32} />
                </div>
                <p className="text-gray-600 text-sm">Carbon Emitted</p>
                <p className="text-2xl font-bold text-gray-800">
                  {parseFloat(report.totalCarbonEmitted || 0).toFixed(2)} kg
                </p>
              </div>
            </div>

            {/* Charts Section */}
            {report.categoryBreakdown && report.categoryBreakdown.length > 0 ? (
              <div className="space-y-6 mb-8">
                {/* Row 1: Category Charts - Items and Spending */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <PieChart size={20} className="text-blue-600" />
                      By Category (Items)
                    </h3>
                    <CategoryPurchaseChart 
                      categoryBreakdown={report.categoryBreakdown} 
                      type="items"
                    />
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <DollarSign size={20} className="text-green-600" />
                      By Category (Spending)
                    </h3>
                    <CategoryPurchaseChart 
                      categoryBreakdown={report.categoryBreakdown} 
                      type="spending"
                    />
                  </div>
                </div>

                {/* Row 2: Category Carbon and Carbon Impact Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Sparkles size={20} className="text-yellow-600" />
                      By Category (Carbon)
                    </h3>
                    <CategoryPurchaseChart 
                      categoryBreakdown={report.categoryBreakdown} 
                      type="carbon"
                    />
                  </div>

                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Leaf size={20} className="text-green-600" />
                      Carbon Impact Details
                    </h3>
                    <CarbonImpactSummary carbonImpactDetails={report.carbonImpactDetails} />
                  </div>
                </div>

                {/* Row 3: Spending Breakdown */}
                <div className="grid grid-cols-1 gap-6">
                  <SpendingSummary 
                    categoryBreakdown={report.categoryBreakdown} 
                    totalSpent={report.totalSpent}
                    title="Spending Breakdown"
                    valueLabel="Spending"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-center">
                <p className="text-gray-600">No category data available to display charts.</p>
              </div>
            )}

            {/* Items Bought Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Items Purchased This Month</h3>
              </div>
              
              {report.itemsBought && report.itemsBought.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seller
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price/Unit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Carbon Impact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.itemsBought.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.sellerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.quantityBought}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            ₹{parseFloat(item.pricePerUnit).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                            ₹{parseFloat(item.totalCost).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {parseFloat(item.totalCarbonEmitted).toFixed(2)} kg
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.orderDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-gray-600">No items purchased this month.</p>
                </div>
              )}
            </div>

            {/* AI-Powered Insights Section */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md overflow-hidden mt-6">
              <div className="p-6 border-b border-purple-200 bg-white/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Wand2 size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">AI-Powered Insights</h3>
                      <p className="text-sm text-gray-600">
                        Get personalized analysis of your shopping behavior powered by Gemini AI
                        {isAICached && <span className="ml-1 text-blue-600">(Report loaded from cache)</span>}
                      </p>
                    </div>
                  </div>
                  {!aiSummary && (
                    <button
                      onClick={handleGenerateAISummary}
                      disabled={loadingAI}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingAI ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 size={18} />
                          Generate AI Summary
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {loadingAI && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={48} className="text-purple-600 animate-spin mb-4" />
                    <p className="text-gray-600 text-lg">Analyzing your shopping data...</p>
                    <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
                  </div>
                )}

                {aiError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">
                      <strong>Error:</strong> {aiError}
                    </p>
                    <button
                      onClick={handleGenerateAISummary}
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {aiSummary && !loadingAI && (
                  <div className="bg-white rounded-lg border border-purple-200 shadow-sm">
                    <div className="p-6">
                      <div className="w-full overflow-auto">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words text-base">
                          {aiSummary}
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Sparkles size={16} className="text-purple-500" />
                            <span>Generated by Gemini 2.5 Flash</span>
                          </div>
                          {isAICached && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700">
                              <span className="font-medium">📦 Cached</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleGenerateAISummary}
                          className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        >
                          <Wand2 size={16} />
                          Regenerate
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!aiSummary && !loadingAI && !aiError && (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <Wand2 size={48} className="text-purple-400 mx-auto mb-3" />
                    </div>
                    <p className="text-gray-600 mb-2">
                      Click the button above to get personalized insights about your shopping habits
                    </p>
                    <p className="text-sm text-gray-500">
                      Our AI will analyze your purchases, carbon impact, and provide recommendations
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && !report && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">
              No data available for the selected month. Try a different month or make some purchases!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
