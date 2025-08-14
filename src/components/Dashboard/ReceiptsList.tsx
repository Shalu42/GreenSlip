import React from 'react';
import { Receipt as ReceiptType } from '../../types';
import { Calendar, DollarSign, Trash2, Download, Shield, AlertTriangle } from 'lucide-react';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ReceiptsListProps {
  receipts: ReceiptType[];
  onDelete: (id: string) => void;
  onExport: (format: 'csv' | 'json') => void;
}

const ReceiptsList: React.FC<ReceiptsListProps> = ({ receipts, onDelete, onExport }) => {
  const handleDelete = (id: string, vendor: string) => {
    if (window.confirm(`Are you sure you want to delete the receipt from ${vendor}?`)) {
      onDelete(id);
      toast.success('Receipt deleted successfully');
    }
  };

  const getEcoScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const isWarrantyExpiring = (warrantyInfo: any) => {
    if (!warrantyInfo?.hasWarranty || !warrantyInfo.expiryDate) return false;
    const expiryDate = parseISO(warrantyInfo.expiryDate);
    const warningDate = addDays(new Date(), 30); // 30 days warning
    return isBefore(expiryDate, warningDate);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Your Receipts</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onExport('csv')}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => onExport('json')}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {receipts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Download className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No receipts uploaded yet</p>
            <p className="text-sm text-gray-400 mt-1">Upload your first receipt to get started</p>
          </div>
        ) : (
          receipts.map((receipt, index) => (
            <motion.div
              key={receipt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{receipt.vendor}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEcoScoreColor(receipt.ecoScore)}`}>
                      Eco: {receipt.ecoScore}/10
                    </span>
                    {receipt.warrantyInfo?.hasWarranty && (
                      <div className="flex items-center space-x-1">
                        {isWarrantyExpiring(receipt.warrantyInfo) ? (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        ) : (
                          <Shield className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-xs text-gray-500">
                          {receipt.warrantyInfo.warrantyPeriod}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(parseISO(receipt.uploadDate), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>${receipt.amount.toFixed(2)}</span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {receipt.category}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="mb-2">{receipt.items.length} item(s)</p>
                    <div className="flex flex-wrap gap-2">
                      {receipt.items.slice(0, 3).map((item, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                          {item.name}
                        </span>
                      ))}
                      {receipt.items.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{receipt.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(receipt.id, receipt.vendor)}
                  className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReceiptsList;