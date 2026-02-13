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

export default function TopProductsChart({ topProducts }) {
  if (!topProducts || topProducts.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No category data available
      </div>
    );
  }

  const data = {
    labels: topProducts.map(p => formatCategoryName(p.category || p.name)),
    datasets: [
      {
        label: 'Carbon Impact (kg CO₂)',
        data: topProducts.map(p => parseFloat(p.carbon)),
        backgroundColor: topProducts.map(p => {
          const carbon = parseFloat(p.carbon);
          return carbon < 2 
            ? 'rgba(34, 197, 94, 0.8)'   // green
            : carbon < 10 
            ? 'rgba(234, 179, 8, 0.8)'   // yellow
            : 'rgba(239, 68, 68, 0.8)';  // red
        }),
        borderColor: topProducts.map(p => {
          const carbon = parseFloat(p.carbon);
          return carbon < 2 
            ? 'rgb(34, 197, 94)'
            : carbon < 10 
            ? 'rgb(234, 179, 8)'
            : 'rgb(239, 68, 68)';
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
            const item = topProducts[context.dataIndex];
            return [
              `Carbon Impact: ${context.parsed.y.toFixed(2)} kg CO₂`,
              `Items: ${item.quantity}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'kg CO₂',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        ticks: {
          callback: function(value) {
            return value.toFixed(1);
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          },
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false
        }
      }
    }
  };

  return (
    <div className="h-80">
      <Bar data={data} options={options} />
    </div>
  );
}
