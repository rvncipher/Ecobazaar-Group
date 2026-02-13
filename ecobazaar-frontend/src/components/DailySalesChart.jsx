import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DailySalesChart({ dailySales, title = 'Daily Sales Performance' }) {
  console.log('DailySalesChart received dailySales:', dailySales);
  console.log('DailySales type:', typeof dailySales);
  console.log('DailySales keys:', dailySales ? Object.keys(dailySales) : 'null/undefined');
  
  if (!dailySales || Object.keys(dailySales).length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No daily sales data available
        </div>
      </div>
    );
  }

  // Sort by date and prepare data
  const sortedDates = Object.keys(dailySales).sort();
  const labels = sortedDates.map(date => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const revenueData = sortedDates.map(date => parseFloat(dailySales[date].revenue || 0));
  const itemsData = sortedDates.map(date => dailySales[date].itemsSold || 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: revenueData,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Items Sold',
        data: itemsData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            const date = sortedDates[context[0].dataIndex];
            return new Date(date).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          },
          afterLabel: function(context) {
            const date = sortedDates[context.dataIndex];
            const orders = dailySales[date].orderCount || 0;
            return `Orders: ${orders}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10
          }
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue (₹)',
          color: 'rgb(16, 185, 129)',
          font: {
            weight: 'bold'
          }
        },
        ticks: {
          callback: function(value) {
            return '₹' + value.toFixed(0);
          },
          color: 'rgb(16, 185, 129)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Items Sold',
          color: 'rgb(59, 130, 246)',
          font: {
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgb(59, 130, 246)'
        }
      },
    }
  };

  // Find peak sales day
  const peakDay = sortedDates.reduce((peak, date) => {
    const currentRevenue = parseFloat(dailySales[date].revenue || 0);
    const peakRevenue = parseFloat(dailySales[peak].revenue || 0);
    return currentRevenue > peakRevenue ? date : peak;
  }, sortedDates[0]);

  const peakDate = new Date(peakDay).toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="text-sm text-gray-600">
          🏆 Peak: <span className="font-semibold text-green-600">{peakDate}</span>
          <span className="ml-2">₹{parseFloat(dailySales[peakDay].revenue).toFixed(0)}</span>
        </div>
      </div>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
