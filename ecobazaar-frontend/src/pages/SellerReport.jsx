import { useState, useEffect, useRef } from 'react';
import { Download, TrendingUp, ShoppingBag, Award, DollarSign, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Layout from '../components/Layout';
import Loader from '../components/Loader';
import MonthSelector from '../components/MonthSelector';
import CategoryPurchaseChart from '../components/CategoryPurchaseChart';
import SpendingSummary from '../components/SpendingSummary';
import DailySalesChart from '../components/DailySalesChart';
import { getSellerSalesReport } from '../services/reportAPI';
import { STORAGE_KEYS } from '../utils/constants';

export default function SellerReport() {
  const navigate = useNavigate();
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
    // Check if user is seller
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'SELLER') {
      navigate('/');
      return;
    }

    // Set default month
    const currentMonth = getCurrentMonth();
    setSelectedMonth(currentMonth);
  }, [navigate]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!selectedMonth) return;
      
      try {
        setLoading(true);
        setError(null);

        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        const user = userStr ? JSON.parse(userStr) : null;
        const sellerId = user?.id || localStorage.getItem('userId');

        if (!sellerId) {
          throw new Error('User not logged in. Please login again.');
        }

        const data = await getSellerSalesReport(sellerId, selectedMonth);
        console.log('Seller Report Data:', data);
        console.log('Category Breakdown:', data.categoryBreakdown);
        console.log('Revenue by Category:', data.revenueByCategory);
        console.log('Daily Sales:', data.dailySales);
        setReport(data);
      } catch (err) {
        console.error('Error fetching seller report:', err);
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

      await new Promise(resolve => setTimeout(resolve, 500));

      const element = reportRef.current;
      
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
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      document.head.removeChild(style);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const availableWidth = pdfWidth - (2 * margin);
      const availableHeight = pdfHeight - (2 * margin);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const scale = availableWidth / imgWidth;
      const scaledHeight = imgHeight * scale;
      const totalPages = Math.ceil(scaledHeight / availableHeight);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();

        const sourceY = (page * availableHeight) / scale;
        const sourceHeight = Math.min(availableHeight / scale, imgHeight - sourceY);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');
        pageCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
        const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
        pdf.addImage(pageImgData, 'PNG', margin, margin, availableWidth, sourceHeight * scale);
      }

      pdf.save(`EcoBazaar_SellerSales_${selectedMonth}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Leaf className="text-green-600" size={36} />
            Seller Sales Report
          </h1>
          <p className="text-gray-600">
            View your sold items and revenue performance
          </p>
        </div>

        {/* Month Selector & PDF Download */}
        <div className="flex justify-between items-center mb-8">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
          />
          {report && (
            <button
              onClick={generatePDF}
              disabled={generatingPDF}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
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

              {/* Items Sold */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="text-purple-600" size={32} />
                </div>
                <p className="text-gray-600 text-sm">Items Sold</p>
                <p className="text-3xl font-bold text-gray-800">
                  {report.totalItemsSold || 0}
                </p>
              </div>

              {/* Revenue */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="text-green-600" size={32} />
                </div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800">
                  ₹{parseFloat(report.totalRevenue || 0).toFixed(2)}
                </p>
              </div>

              {/* Carbon Impact */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <Award className="text-yellow-600" size={32} />
                </div>
                <p className="text-gray-600 text-sm">Carbon Impact</p>
                <p className="text-2xl font-bold text-gray-800">
                  {parseFloat(report.totalCarbonImpact || 0).toFixed(2)} kg
                </p>
              </div>
            </div>

            {/* Revenue by Category & Carbon Impact - Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SpendingSummary
                categoryBreakdown={report.categoryBreakdown}
                title="Revenue Earned by Category"
                valueLabel="Revenue"
              />
              <CategoryPurchaseChart
                categoryBreakdown={report.categoryBreakdown}
                type="carbon"
              />
            </div>

            {/* Daily Sales Performance - Row 2 Full Width */}
            <div className="mb-8">
              <DailySalesChart
                dailySales={report.dailySales}
                title="Daily Sales Performance"
              />
            </div>

            {/* Items Sold Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Items Sold This Month</h3>
              </div>
              
              {report.itemsSold && report.itemsSold.length > 0 ? (
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
                          Buyer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price/Unit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Revenue
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
                      {report.itemsSold.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.category || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.buyerName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.quantitySold}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            ₹{parseFloat(item.pricePerUnit).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            ₹{parseFloat(item.totalRevenue).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {parseFloat(item.totalCarbonImpact).toFixed(2)} kg
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
                  <p className="text-gray-600">No items sold this month.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !report && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">
              No sales data available for the selected month. Try a different month!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
