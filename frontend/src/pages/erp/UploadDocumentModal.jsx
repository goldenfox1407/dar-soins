import React, { useState } from 'react';
import { X, Paperclip, Upload } from 'lucide-react';
import api from '../../services/api';

export default function UploadDocumentModal({ achatId, reference, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      await api.post(`/achats/${achatId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Document uploadé avec succès !');
      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur upload:', error);
      alert("Erreur lors de l'upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-lg max-w-md w-full shadow-xl text-[#495057] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#dee2e6] bg-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Paperclip className="text-[#2563eb]" />
            Joindre un document : {reference}
          </h2>
          <button onClick={onClose} className="text-[#adb5bd] hover:text-[#495057] cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={uploadFile} className="p-6">
          <div className="mb-6">
            <label className="block text-[13px] font-semibold mb-2">Sélectionner un fichier (PDF, Image) *</label>
            <div className="border-2 border-dashed border-[#ced4da] rounded-lg p-6 text-center hover:bg-[#f8f9fa] transition-colors relative cursor-pointer">
              <Upload className="mx-auto mb-2 text-[#adb5bd]" size={24} />
              <p className="text-[13px] text-[#6c757d]">Cliquez pour sélectionner ou glissez-déposez ici</p>
              <p className="text-[11px] text-[#adb5bd] mt-1">Taille maximale : 10MB</p>
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleFileChange}
                required
              />
            </div>
            {file && (
              <div className="mt-3 p-2 bg-[#e9ecef] rounded-md text-[13px] flex items-center justify-between">
                <span className="truncate pr-4">{file.name}</span>
                <span className="text-[#6c757d]">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#dee2e6]">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-white border border-[#ced4da] rounded-md text-[13px] font-semibold hover:bg-[#f8f9fa] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isUploading || !file}
              className="px-4 py-2 bg-[#2563eb] text-white rounded-md text-[13px] font-semibold flex items-center gap-2 hover:bg-[#1d4ed8] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload size={14} /> {isUploading ? 'Upload...' : 'Uploader'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
