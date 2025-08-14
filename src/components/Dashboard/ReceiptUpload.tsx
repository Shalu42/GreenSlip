import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ReceiptUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({ onUpload, isUploading }) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        await onUpload(file);
        toast.success('Receipt uploaded successfully!');
      } catch (error) {
        toast.error('Upload failed. Please try again.');
      }
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 mb-8"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Receipt</h3>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-lg font-medium text-gray-700">Processing receipt...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-3 rounded-full mb-4">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragActive ? 'Drop the receipt here' : 'Drag & drop your receipt'}
            </p>
            <p className="text-sm text-gray-500 mb-4">or click to select files</p>
            <p className="text-xs text-gray-400">Supports JPG, PNG, PDF up to 10MB</p>
          </div>
        )}
      </div>

      {acceptedFiles.length > 0 && !isUploading && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{acceptedFiles[0].name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                acceptedFiles.splice(0, 1);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ReceiptUpload;