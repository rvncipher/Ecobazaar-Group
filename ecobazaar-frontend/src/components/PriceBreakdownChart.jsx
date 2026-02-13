import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { DollarSign, TrendingUp, Package } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Category name mapping for better display
const formatCategoryName = (category) => {
  const categoryMap = {
    'ELECTRONICS': 'Electronics',
    'CLOTHING': 'Clothing',
    'FOOD': 'Food & Beverages',
    'HOME_GARDEN': 'Home & Garden',
    'BEAUTY': 'Beauty & Care',
    'SPORTS': 'Sports & Outdoors',
    'TOYS': 'Toys & Games',
    'BOOKS': 'Books & Stationery',
    'AUTOMOTIVE': 'Automotive',
    'HEALTH': 'Health & Wellness',
    'FURNITURE': 'Furniture',
    'OTHER': 'Other'
  };
  return categoryMap[category] || category;
};

export default function PriceBreakdownChart({ categoryBreakdown, totalSpent }) {
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No spending data available
      </div>
    );
  }

  // Sort by spending descending
  const sortedCategories = [...categoryBreakdown].sort(
    (a, b) => parseFloat(b.totalSpent) - parseFloat(a.totalSpent)
  );

  // Find highest spending category
  const highestSpending = sortedCategories[0];
  const highestAmount = parseFloat(highestSpending.totalSpent);

  const data = {
    labels: sortedCategories.map(cat => formatCategoryName(cat.category)),
    datasets: [
      {
        label: 'Amount Spent (₹)',
        data: sortedCategories.map(cat => parseFloat(cat.totalSpent)),
        backgroundColor: sortedCategories.map(cat => {
          const amount = parseFloat(cat.totalSpent);
          const percentage = (amount / highestAmount) * 100;
          
          if (percentage >= 80) return 'rgba(239, 68, 68, 0.8)';    // red - highest
          if (percentage >= 50) return 'rgba(245, 158, 11, 0.8)';   // amber - high
          if (percentage >= 25) return 'rgba(234, 179, 8, 0.8)';    // yellow - medium
          return 'rgba(34, 197, 94, 0.8)';                          // green - low
        }),
        borderColor: sortedCategories.map(cat => {
          const amount = parseFloat(cat.totalSpent);
          const percentage = (amount / highestAmount) * 100;
          
          if (percentage >= 80) return 'rgb(239, 68, 68)';
          if (percentage >= 50) return 'rgb(245, 158, 11)';
          if (percentage >= 25) return 'rgb(234, 179, 8)';
          return 'rgb(34, 197, 94)';
        }),
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            return formatCategoryName(context[0].label);
          },
          label: function(context) {
            const category = sortedCategories[context.dataIndex];
            const amount = parseFloat(category.totalSpent);
            const percentage = totalSpent > 0 
              ? ((amount / parseFloat(totalSpent)) * 100).toFixed(1)
              : 0;
            
            return [
              `Amount: ₹${amount.toFixed(2)}`,
              `Items: ${category.itemCount}`,
              `Percentage: ${percentage}% of total`,
              `Avg per item: ₹${(amount / category.itemCount).toFixed(2)}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toFixed(0);
          }
        }
      }
    }
  };

  // Calculate statistics
  const avgSpendingPerCategory = parseFloat(totalSpent) / categoryBreakdown.length;
  const topCategory = sortedCategories[0];
  const topCategoryPercentage = ((parseFloat(topCategory.totalSpent) / parseFloat(totalSpent)) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-blue-600" size={24} />
            <span className="text-xs text-blue-600 font-semibold">TOTAL SPENT</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            ₹{parseFloat(totalSpent).toFixed(2)}
          </p>
          <p className="text-xs text-blue-600 mt-1">Across all categories</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-purple-600" size={24} />
            <span className="text-xs text-purple-600 font-semibold">TOP CATEGORY</span>
          </div>
          <p className="text-lg font-bold text-purple-700">
            {formatCategoryName(topCategory.category)}
          </p>
          <p className="text-xs text-purple-600 mt-1">
            ₹{parseFloat(topCategory.totalSpent).toFixed(2)} ({topCategoryPercentage}%)
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="text-green-600" size={24} />
            <span className="text-xs text-green-600 font-semibold">AVG/CATEGORY</span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            ₹{avgSpendingPerCategory.toFixed(2)}
          </p>
          <p className="text-xs text-green-600 mt-1">Average spending</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign size={20} className="text-blue-600" />
          Spending by Category
        </h4>
        <div className="h-80">
          <Bar data={data} options={options} />
        </div>
      </div>

      {/* Spending Breakdown List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Detailed Breakdown</h4>
        <div className="space-y-3">
          {sortedCategories.map((category, index) => {
            const amount = parseFloat(category.totalSpent);
            const percentage = ((amount / parseFloat(totalSpent)) * 100).toFixed(1);
            const avgPerItem = amount / category.itemCount;
            
            return (
              <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-800">
                      {formatCategoryName(category.category)}
                    </h5>
                    <p className="text-xs text-gray-600">
                      {category.itemCount} items • ₹{avgPerItem.toFixed(2)} per item
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">₹{amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-600">{percentage}%</p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">💡 Spending Insights</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              You spent <strong>{topCategoryPercentage}%</strong> of your budget on{' '}
              <strong>{formatCategoryName(topCategory.category)}</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              You shopped across <strong>{categoryBreakdown.length}</strong> different categories
            </span>
          </li>
          {sortedCategories.length >= 3 && (
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Your top 3 categories account for{' '}
                <strong>
                  {(
                    ((parseFloat(sortedCategories[0].totalSpent) +
                      parseFloat(sortedCategories[1].totalSpent) +
                      parseFloat(sortedCategories[2].totalSpent)) /
                      parseFloat(totalSpent)) *
                    100
                  ).toFixed(1)}%
                </strong>{' '}
                of total spending
              </span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
