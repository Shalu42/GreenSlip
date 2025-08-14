import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Layout/Header';
import StatsCards from '../components/Dashboard/StatsCards';
import EcoChart from '../components/Dashboard/EcoChart';
import ReceiptUpload from '../components/Dashboard/ReceiptUpload';
import ReceiptsList from '../components/Dashboard/ReceiptsList';
import { useReceipts } from '../hooks/useReceipts';

const Dashboard: React.FC = () => {
  const { receipts, loading, ecoStats, uploadReceipt, deleteReceipt, exportReceipts } = useReceipts();

  const warningCount = receipts.filter(r => 
    r.warrantyInfo?.hasWarranty && r.warrantyInfo?.isExpiring
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your receipts and track your eco-impact</p>
        </motion.div>

        <StatsCards 
          receiptsCount={receipts.length}
          ecoStats={ecoStats}
          warningCount={warningCount}
        />

        <EcoChart ecoStats={ecoStats} />

        <ReceiptUpload 
          onUpload={uploadReceipt}
          isUploading={loading}
        />

        <ReceiptsList
          receipts={receipts}
          onDelete={deleteReceipt}
          onExport={exportReceipts}
        />
      </main>
    </div>
  );
};

export default Dashboard;