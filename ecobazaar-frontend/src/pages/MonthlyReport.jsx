import { useState, useEffect, useRef } from 'react';
import { TrendingUp, ShoppingBag, Award, Sparkles, PieChart, DollarSign, Download, Leaf } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import MonthSelector from '../components/MonthSelector';
import CategoryPurchaseChart from '../components/CategoryPurchaseChart';
import CarbonImpactSummary from '../components/CarbonImpactSummary';
import SpendingSummary from '../components/SpendingSummary';
import { getUserPurchaseReport } from '../services/reportAPI';
import { STORAGE_KEYS } from '../utils/constants';

export default function MonthlyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const reportRef = useRef(null);

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    // Set default month
    const currentMonth = getCurrentMonth();
    setSelectedMonth(currentMonth);
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
        .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
        .border-blue-200 { border-color: rgb(191, 219, 254) !important; }
        .border-green-200 { border-color: rgb(187, 247, 208) !important; }
        .border-red-200 { border-color: rgb(254, 202, 202) !important; }
        .divide-gray-200 > * { border-color: rgb(229, 231, 235) !important; }
        
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
