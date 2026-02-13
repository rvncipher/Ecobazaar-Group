import { useState } from 'react';

export default function MonthSelector({ selectedMonth, onMonthChange }) {
  const [isCustom, setIsCustom] = useState(false);

  // Generate last 6 months
  const getRecentMonths = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({ value: yearMonth, label });
    }
    
    return months;
  };

  const months = getRecentMonths();

  const handleMonthChange = (value) => {
    onMonthChange(value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <label className="text-sm font-medium text-gray-700">
        Select Month:
      </label>
      
      {!isCustom ? (
        <div className="flex gap-2">
          <select
            value={selectedMonth || months[0].value}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setIsCustom(true)}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
          >
            Custom Date
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="month"
            value={selectedMonth || months[0].value}
            onChange={(e) => handleMonthChange(e.target.value)}
            max={months[0].value}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          <button
            onClick={() => setIsCustom(false)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Quick Select
          </button>
        </div>
      )}
    </div>
  );
}
