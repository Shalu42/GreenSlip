import { useState, useEffect } from 'react';
import { Receipt, EcoStats } from '../types';

// Mock data for demonstration
const mockReceipts: Receipt[] = [
  {
    id: '1',
    userId: '1',
    filename: 'receipt1.jpg',
    originalName: 'grocery-receipt-2024.jpg',
    uploadDate: '2024-01-15T10:30:00Z',
    parsedText: 'WHOLE FOODS MARKET\nBANANAS ORGANIC 2.5 LB $4.99\nALMOND MILK UNSWEETENED $3.49\nTOTAL: $8.48',
    amount: 8.48,
    currency: 'USD',
    vendor: 'Whole Foods Market',
    category: 'Groceries',
    items: [
      { name: 'Bananas Organic', quantity: 1, price: 4.99, category: 'Produce', ecoImpact: 9 },
      { name: 'Almond Milk Unsweetened', quantity: 1, price: 3.49, category: 'Dairy Alternative', ecoImpact: 7 }
    ],
    warrantyInfo: { hasWarranty: false },
    ecoScore: 8.0
  },
  {
    id: '2',
    userId: '1',
    filename: 'receipt2.jpg',
    originalName: 'electronics-store.jpg',
    uploadDate: '2024-01-10T14:20:00Z',
    parsedText: 'BEST BUY\nWIRELESS HEADPHONES $99.99\nWARRANTY: 2 YEARS\nTOTAL: $99.99',
    amount: 99.99,
    currency: 'USD',
    vendor: 'Best Buy',
    category: 'Electronics',
    items: [
      { name: 'Wireless Headphones', quantity: 1, price: 99.99, category: 'Electronics', ecoImpact: 3 }
    ],
    warrantyInfo: {
      hasWarranty: true,
      warrantyPeriod: '2 years',
      expiryDate: '2026-01-10T14:20:00Z',
      isExpiring: false
    },
    ecoScore: 3.0
  },
  {
    id: '3',
    userId: '1',
    filename: 'receipt3.jpg',
    originalName: 'restaurant-bill.jpg',
    uploadDate: '2024-01-12T19:45:00Z',
    parsedText: 'GREEN LEAF CAFE\nQUINOA SALAD $12.99\nKOMBUCHA $4.99\nTOTAL: $17.98',
    amount: 17.98,
    currency: 'USD',
    vendor: 'Green Leaf Cafe',
    category: 'Restaurant',
    items: [
      { name: 'Quinoa Salad', quantity: 1, price: 12.99, category: 'Food', ecoImpact: 8 },
      { name: 'Kombucha', quantity: 1, price: 4.99, category: 'Beverage', ecoImpact: 7 }
    ],
    warrantyInfo: { hasWarranty: false },
    ecoScore: 7.5
  }
];

export const useReceipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [ecoStats, setEcoStats] = useState<EcoStats | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReceipts(mockReceipts);
      
      // Calculate eco stats
      const totalScore = mockReceipts.reduce((sum, receipt) => sum + receipt.ecoScore, 0);
      const averageScore = totalScore / mockReceipts.length;
      const greenPurchases = mockReceipts.filter(r => r.ecoScore >= 7).length;
      
      setEcoStats({
        totalScore,
        averageScore,
        greenPurchases,
        totalPurchases: mockReceipts.length,
        monthlyTrend: [
          { month: 'Dec', score: 6.2 },
          { month: 'Jan', score: 6.8 },
          { month: 'Feb', score: 7.1 },
          { month: 'Mar', score: 6.9 }
        ]
      });
      
      setLoading(false);
    }, 800);
  }, []);

  const uploadReceipt = async (file: File) => {
    setLoading(true);
    
    // Mock upload process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newReceipt: Receipt = {
      id: Date.now().toString(),
      userId: '1',
      filename: `receipt_${Date.now()}.jpg`,
      originalName: file.name,
      uploadDate: new Date().toISOString(),
      parsedText: 'MOCK PARSED TEXT\nITEM 1 $10.00\nITEM 2 $5.00\nTOTAL: $15.00',
      amount: 15.00,
      currency: 'USD',
      vendor: 'Sample Store',
      category: 'General',
      items: [
        { name: 'Sample Item', quantity: 1, price: 15.00, category: 'General', ecoImpact: 5 }
      ],
      warrantyInfo: { hasWarranty: false },
      ecoScore: 5.0
    };
    
    setReceipts(prev => [newReceipt, ...prev]);
    setLoading(false);
    
    return newReceipt;
  };

  const deleteReceipt = async (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
  };

  const exportReceipts = (format: 'csv' | 'json') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(receipts, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'receipts.json';
      link.click();
    } else {
      const csvHeader = 'ID,Date,Vendor,Amount,Category,Eco Score\n';
      const csvData = receipts.map(r => 
        `${r.id},${r.uploadDate},${r.vendor},${r.amount},${r.category},${r.ecoScore}`
      ).join('\n');
      const dataBlob = new Blob([csvHeader + csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'receipts.csv';
      link.click();
    }
  };

  return {
    receipts,
    loading,
    ecoStats,
    uploadReceipt,
    deleteReceipt,
    exportReceipts
  };
};