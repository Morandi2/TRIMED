import React, { useState, useRef, FC } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface DragDropUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  label?: string;
  files?: File[];
}

const DragDropUpload: FC<DragDropUploadProps> = ({ 
  onFilesSelected, 
  maxFiles = 5, 
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png'],
  label = "Documents Justificatifs",
  files = []
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return acceptedTypes.includes(ext);
    });

    if (validFiles.length > 0) {
      onFilesSelected([...files, ...validFiles].slice(0, maxFiles));
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesSelected(updatedFiles);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 min-h-[160px] flex flex-col items-center justify-center p-6
          ${isDragging 
            ? 'border-brand-500 bg-brand-500/5 ring-4 ring-brand-500/10' 
            : 'border-white/20 hover:border-brand-400 bg-white/5 hover:bg-white/10 dark:bg-brand-900/10'
          } backdrop-blur-md`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => processFiles(Array.from(e.target.files || []))}
          multiple
          className="hidden"
          accept={acceptedTypes.join(',')}
        />

        <div className={`flex flex-col items-center gap-3 transition-transform duration-300 ${isDragging ? 'text-brand-500 -translate-y-1' : 'text-gray-500 dark:text-gray-400'}`}>
          <div className={`p-4 rounded-full bg-white/10 dark:bg-brand-800/20 ${isDragging ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-500' : 'text-gray-400 group-hover:text-brand-500 transition-colors'}`}>
            <Upload size={28} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">
              {isDragging ? 'Déposez les fichiers ici' : 'Cliquez ou glissez vos documents'}
            </p>
            <p className="text-[11px] mt-1 opacity-70">
              {acceptedTypes.join(', ').toUpperCase()} • Max {maxFiles} fichiers
            </p>
          </div>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full" />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center gap-3 p-3 bg-white/40 dark:bg-brand-900/20 backdrop-blur-sm border border-white/20 dark:border-brand-800/30 rounded-xl transition-all hover:shadow-md"
            >
              <div className="p-2 bg-brand-500/10 rounded-lg text-brand-600 dark:text-brand-400">
                <FileText size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                className="p-1 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DragDropUpload;
