import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { EcoStats } from '../../types';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface EcoChartProps {
  ecoStats: EcoStats | null;
}

const EcoChart: React.FC<EcoChartProps> = ({ ecoStats }) => {
  if (!ecoStats) return null;

  const lineData = {
    labels: ecoStats.monthlyTrend.map(item => item.month),
    datasets: [
      {
        label: 'Eco Score Trend',
        data: ecoStats.monthlyTrend.map(item => item.score),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const doughnutData = {
    labels: ['Green Purchases', 'Regular Purchases'],
    datasets: [
      {
        data: [ecoStats.greenPurchases, ecoStats.totalPurchases - ecoStats.greenPurchases],
        backgroundColor: ['#10B981', '#E5E7EB'],
        borderColor: ['#059669', '#D1D5DB'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Eco Score Trend</h3>
        <div className="h-64">
          <Line data={lineData} options={chartOptions} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Distribution</h3>
        <div className="h-64">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </motion.div>
    </div>
  );
};

export default EcoChart;