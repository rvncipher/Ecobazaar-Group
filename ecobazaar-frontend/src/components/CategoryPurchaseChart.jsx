import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
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

// Generate consistent colors for categories
const getCategoryColors = (count) => {
  const baseColors = [
    { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgb(59, 130, 246)' },      // blue
    { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgb(16, 185, 129)' },      // green
    { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgb(245, 158, 11)' },      // amber
    { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgb(239, 68, 68)' },        // red
    { bg: 'rgba(168, 85, 247, 0.8)', border: 'rgb(168, 85, 247)' },      // purple
    { bg: 'rgba(236, 72, 153, 0.8)', border: 'rgb(236, 72, 153)' },      // pink
    { bg: 'rgba(20, 184, 166, 0.8)', border: 'rgb(20, 184, 166)' },      // teal
    { bg: 'rgba(251, 146, 60, 0.8)', border: 'rgb(251, 146, 60)' },      // orange
    { bg: 'rgba(99, 102, 241, 0.8)', border: 'rgb(99, 102, 241)' },      // indigo
    { bg: 'rgba(132, 204, 22, 0.8)', border: 'rgb(132, 204, 22)' },      // lime
  ];
  
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

export default function CategoryPurchaseChart({ categoryBreakdown, type = 'items' }) {
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No category data available
      </div>
    );
  }

  const colors = getCategoryColors(categoryBreakdown.length);

  // Prepare data based on type (items, spending, or carbon)
  const getValue = (cat) => {
    switch (type) {
      case 'items':
        return cat.itemCount || 0;
      case 'spending':
        return parseFloat(cat.totalSpent || cat.totalRevenue || 0);
      case 'carbon':
        return parseFloat(cat.totalCarbonEmitted || 0);
      default:
        return cat.itemCount || 0;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'items':
        return 'Items';
      case 'spending':
        // Check if we have totalSpent or totalRevenue
        return categoryBreakdown[0]?.totalSpent !== undefined ? 'Amount Spent (₹)' : 'Revenue Earned (₹)';
      case 'carbon':
        return 'Carbon Emitted (kg CO₂)';
      default:
        return 'Items';
    }
  };

  const data = {
    labels: categoryBreakdown.map(cat => formatCategoryName(cat.category)),
    datasets: [
      {
        label: getLabel(),
        data: categoryBreakdown.map(cat => getValue(cat)),
        backgroundColor: colors.map(c => c.bg),
        borderColor: colors.map(c => c.border),
        borderWidth: 2,
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
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const category = categoryBreakdown[context.dataIndex];
            
            const lines = [label];
            
            if (type === 'items') {
              lines.push(`Items: ${value}`);
              lines.push(`Spent: ₹${parseFloat(category.totalSpent).toFixed(2)}`);
              lines.push(`Carbon: ${parseFloat(category.totalCarbonEmitted).toFixed(2)} kg`);
            } else if (type === 'spending') {
              lines.push(`Amount: ₹${value.toFixed(2)}`);
              lines.push(`Items: ${category.itemCount}`);
            } else if (type === 'carbon') {
              lines.push(`Carbon: ${value.toFixed(2)} kg CO₂`);
              lines.push(`Items: ${category.itemCount}`);
            }
            
            return lines;
          }
        }
      }
    }
  };

  const title = type === 'items' 
    ? (categoryBreakdown[0]?.totalSpent !== undefined ? 'Items Purchased by Category' : 'Items Sold by Category')
    : type === 'spending' 
    ? (categoryBreakdown[0]?.totalSpent !== undefined ? 'Spending by Category' : 'Revenue by Category')
    : 'Carbon Emissions by Category';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      <div className="h-64 mb-4">
        <Pie data={data} options={options} />
      </div>
      {/* Custom Legend - 2 items per row */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {data.labels.map((label, index) => {
          const value = data.datasets[0].data[index];
          const formattedValue = type === 'spending' 
            ? `₹${value.toFixed(0)}` 
            : type === 'carbon'
            ? `${value.toFixed(1)}kg`
            : value;
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
              />
              <span className="text-gray-700 truncate">
                {label}: <span className="font-medium">{formattedValue}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
