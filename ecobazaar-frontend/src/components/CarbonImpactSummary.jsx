import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Leaf, TrendingDown, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function CarbonImpactSummary({ carbonImpactDetails }) {
  if (!carbonImpactDetails) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No carbon impact data available
      </div>
    );
  }

  const {
    totalCarbonEmitted = 0,
    estimatedCarbonSaved = 0,
    ecoFriendlyItemCount = 0,
    moderateImpactItemCount = 0,
    highImpactItemCount = 0
  } = carbonImpactDetails;

  const totalItems = ecoFriendlyItemCount + moderateImpactItemCount + highImpactItemCount;
  
  const ratingData = {
    labels: ['Eco-Friendly', 'Moderate', 'High Impact'],
    datasets: [
      {
        data: [ecoFriendlyItemCount, moderateImpactItemCount, highImpactItemCount],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
        ],
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
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const percentage = totalItems > 0 ? ((value / totalItems) * 100).toFixed(1) : 0;
            return `${context.label}: ${value} items (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-red-50 border border-red-200 rounded p-3 text-center">
          <TrendingUp className="text-red-600 mx-auto mb-1" size={20} />
          <p className="text-lg font-bold text-red-700">{parseFloat(totalCarbonEmitted).toFixed(1)}</p>
          <p className="text-xs text-red-600">kg Emitted</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
          <TrendingDown className="text-green-600 mx-auto mb-1" size={20} />
          <p className="text-lg font-bold text-green-700">{parseFloat(estimatedCarbonSaved).toFixed(1)}</p>
          <p className="text-xs text-green-600">kg Saved</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
          <Leaf className="text-blue-600 mx-auto mb-1" size={20} />
          <p className="text-lg font-bold text-blue-700">{totalItems > 0 ? ((ecoFriendlyItemCount / totalItems) * 100).toFixed(0) : 0}%</p>
          <p className="text-xs text-blue-600">Eco Score</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <Doughnut data={ratingData} options={options} />
      </div>

      {/* Custom Legend - 2 items per row */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {ratingData.labels.map((label, index) => {
          const value = ratingData.datasets[0].data[index];
          const percentage = totalItems > 0 ? ((value / totalItems) * 100).toFixed(0) : 0;
          
          return (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: ratingData.datasets[0].backgroundColor[index] }}
              />
              <span className="text-gray-700 truncate">
                {label}: <span className="font-medium">{value} ({percentage}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
