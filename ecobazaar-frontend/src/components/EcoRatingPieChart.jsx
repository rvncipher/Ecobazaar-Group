import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function EcoRatingPieChart({ ecoFriendly, moderate, highImpact }) {
  const data = {
    labels: ['Eco-Friendly', 'Moderate', 'High Impact'],
    datasets: [
      {
        label: 'Products by Eco-Rating',
        data: [ecoFriendly || 0, moderate || 0, highImpact || 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // green
          'rgba(234, 179, 8, 0.8)',   // yellow
          'rgba(239, 68, 68, 0.8)'    // red
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)'
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
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="h-64">
      <Pie data={data} options={options} />
    </div>
  );
}
