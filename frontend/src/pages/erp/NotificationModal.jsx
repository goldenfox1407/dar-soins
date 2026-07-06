import React, { useState } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import api from '../../services/api';

export default function NotificationModal({ achatId, reference, type, onClose }) {
  const [message, setMessage] = useState(`Bonjour,\n\nCeci concerne l'achat portant la référence ${reference}.\n\nCordialement.`);
  const [isSending, setIsSending] = useState(false);

  const getTitle = () => {
    switch(type) {
      case 'email': return 'Envoyer un Email';
      case 'sms': return 'Envoyer un SMS';
      case 'whatsapp': return 'Notification WhatsApp';
      default: return 'Envoyer une notification';
    }
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Le message ne peut pas être vide.");
      return;
    }
    
    setIsSending(true);
    
    try {
      if (type === 'whatsapp') {
        // En vrai, il faudrait le n° du fournisseur. On simule ici un lien wa.me générique
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      }
      
      // On loggue toujours l'envoi côté backend
      await api.post(`/achats/${achatId}/notify`, { type, message });
      
      alert('Notification envoyée avec succès !');
      onClose();
    } catch (error) {
      console.error('Erreur notification:', error);
      alert("Erreur lors de l'envoi de la notification.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-lg max-w-lg w-full shadow-xl text-[#495057] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#dee2e6] bg-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="text-[#2563eb]" />
            {getTitle()} : {reference}
          </h2>
          <button onClick={onClose} className="text-[#adb5bd] hover:text-[#495057] cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={sendNotification} className="p-6">
          <div className="mb-6">
            <label className="block text-[13px] font-semibold mb-2">Message *</label>
            <textarea 
              rows="6"
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              className="w-full border border-[#ced4da] rounded-md px-3 py-2 outline-none focus:border-[#80bdff] text-[13px] resize-none" 
              required
            />
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
              disabled={isSending}
              className="px-4 py-2 bg-[#2563eb] text-white rounded-md text-[13px] font-semibold flex items-center gap-2 hover:bg-[#1d4ed8] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send size={14} /> {isSending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
