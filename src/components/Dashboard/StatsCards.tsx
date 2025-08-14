import React from 'react';
import { Receipt, Leaf, AlertTriangle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { EcoStats } from '../../types';

interface StatsCardsProps {
  receiptsCount: number;
  ecoStats: EcoStats | null;
  warningCount: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ receiptsCount, ecoStats, warningCount }) => {
  const cards = [
    {
      title: 'Total Receipts',
      value: receiptsCount,
      icon: Receipt,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Avg Eco Score',
      value: ecoStats ? ecoStats.averageScore.toFixed(1) : '0.0',
      icon: Leaf,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    },
    {
      title: 'Green Purchases',
      value: ecoStats ? ecoStats.greenPurchases : 0,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Warranty Alerts',
      value: warningCount,
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className={`${card.bgColor} p-3 rounded-lg`}>
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;