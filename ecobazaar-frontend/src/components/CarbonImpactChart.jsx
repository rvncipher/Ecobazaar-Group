import { Bar, Doughnut } from 'react-chartjs-2';
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
import { Leaf, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function CarbonImpactChart({ carbonImpactDetails }) {
  if (!carbonImpactDetails) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No carbon impact data available
      </div>
    );
  }

  const {
    totalCarbonEmitted = 0,
    estimatedCarbonSaved = 0,
    averageCarbonPerItem = 0,
    ecoFriendlyItemCount = 0,
    moderateImpactItemCount = 0,
    highImpactItemCount = 0
  } = carbonImpactDetails;

  // Eco Rating Distribution Chart
  const totalItems = ecoFriendlyItemCount + moderateImpactItemCount + highImpactItemCount;
  
  const ratingData = {
    labels: ['Eco-Friendly', 'Moderate Impact', 'High Impact'],
    datasets: [
      {
        label: 'Items by Eco Rating',
        data: [ecoFriendlyItemCount, moderateImpactItemCount, highImpactItemCount],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // green
          'rgba(234, 179, 8, 0.8)',   // yellow
          'rgba(239, 68, 68, 0.8)',   // red
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

  const ratingOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = totalItems > 0 ? ((value / totalItems) * 100).toFixed(1) : 0;
                
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const percentage = totalItems > 0 ? ((value / totalItems) * 100).toFixed(1) : 0;
            return [
              `Items: ${value}`,
              `Percentage: ${percentage}%`
            ];
          }
        }
      }
    }
  };

  // Carbon Comparison Chart
  const carbonComparisonData = {
    labels: ['Carbon Emitted', 'Carbon Saved (est.)'],
    datasets: [
      {
        label: 'kg CO₂',
        data: [
          parseFloat(totalCarbonEmitted),
          parseFloat(estimatedCarbonSaved)
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // red for emitted
          'rgba(34, 197, 94, 0.8)',   // green for saved
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 2
      }
    ]
  };

  const carbonComparisonOptions = {
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
          label: function(context) {
            const value = context.parsed.y;
            return `${context.label}: ${value.toFixed(2)} kg CO₂`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toFixed(1) + ' kg';
          }
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-red-600" size={24} />
            <span className="text-xs text-red-600 font-semibold">EMITTED</span>
          </div>
          <p className="text-2xl font-bold text-red-700">
            {parseFloat(totalCarbonEmitted).toFixed(2)} kg
          </p>
          <p className="text-xs text-red-600 mt-1">Total CO₂ emissions</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="text-green-600" size={24} />
            <span className="text-xs text-green-600 font-semibold">SAVED</span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {parseFloat(estimatedCarbonSaved).toFixed(2)} kg
          </p>
          <p className="text-xs text-green-600 mt-1">By choosing eco-friendly</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Leaf className="text-blue-600" size={24} />
            <span className="text-xs text-blue-600 font-semibold">AVERAGE</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {parseFloat(averageCarbonPerItem).toFixed(2)} kg
          </p>
          <p className="text-xs text-blue-600 mt-1">Per item purchased</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eco Rating Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-blue-600" />
            Items by Eco Rating
          </h4>
          <div className="h-64">
            <Doughnut data={ratingData} options={ratingOptions} />
          </div>
        </div>

        {/* Carbon Comparison */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Leaf size={20} className="text-green-600" />
            Carbon Impact Comparison
          </h4>
          <div className="h-64">
            <Bar data={carbonComparisonData} options={carbonComparisonOptions} />
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Great job!</span> By choosing eco-friendly products, 
              you've saved an estimated <span className="font-bold">{parseFloat(estimatedCarbonSaved).toFixed(2)} kg CO₂</span> 
              {' '}compared to high-impact alternatives.
            </p>
          </div>
        </div>
      </div>

      {/* Eco-Friendly Score */}
      {totalItems > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Your Eco Score</h4>
              <p className="text-sm text-gray-600">
                {ecoFriendlyItemCount} out of {totalItems} items were eco-friendly
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-600">
                {((ecoFriendlyItemCount / totalItems) * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-gray-600 mt-1">Eco-Friendly Purchases</p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(ecoFriendlyItemCount / totalItems) * 100}%` }}
            />
          </div>
          
          {/* Recommendations */}
          <div className="mt-4 flex items-start gap-2">
            <Leaf className="text-green-600 mt-1 flex-shrink-0" size={16} />
            <p className="text-sm text-gray-700">
              {ecoFriendlyItemCount / totalItems >= 0.7 
                ? "Excellent! You're making conscious eco-friendly choices. Keep it up!"
                : ecoFriendlyItemCount / totalItems >= 0.4
                ? "Good progress! Try to increase eco-friendly purchases to reduce your carbon footprint."
                : "Consider choosing more eco-friendly products to reduce your environmental impact."
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
