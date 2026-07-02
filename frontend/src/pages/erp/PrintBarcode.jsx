import React, { useState, useEffect } from 'react';
import { Printer, Search, Barcode } from 'lucide-react';
import api from '../../services/api';

export default function PrintBarcode() {
  const [produits, setProduits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      const response = await api.get('/produits');
      setProduits(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const filteredProduits = produits.filter(p => 
    p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.code_barres && p.code_barres.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-panel p-6 animate-fade-in" style={{ padding: '2rem', display: 'flex', gap: '2rem' }}>
      {/* Colonne Recherche */}
      <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <header>
          <h1 className="text-2xl font-bold" style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}>Imprimer Code-barres</h1>
          <p className="text-muted text-sm mt-1">Recherchez un produit pour générer son étiquette.</p>
        </header>

        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.8rem 1rem' }}>
          <Search size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou code..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
          />
        </div>

        <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', maxHeight: '500px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredProduits.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelectedProduct(p)}
              style={{ 
                padding: '1rem', 
                background: selectedProduct?.id === p.id ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.02)', 
                border: `1px solid ${selectedProduct?.id === p.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: '600', color: 'white', marginBottom: '4px' }}>{p.nom}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.code_barres || 'Généré auto: ' + p.id} - {p.prix_client} MAD</div>
            </div>
          ))}
          {filteredProduits.length === 0 && <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Aucun produit trouvé</div>}
        </div>
      </div>

      {/* Colonne Aperçu et Impression */}
      <div style={{ flex: 2, background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {selectedProduct ? (
          <>
            <div className="barcode-preview" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', width: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'black', marginBottom: '10px', textAlign: 'center' }}>Dar-Soins ERP</div>
              <div style={{ fontSize: '0.9rem', color: '#333', marginBottom: '15px', textAlign: 'center' }}>{selectedProduct.nom}</div>
              
              {/* Simulation de code-barres (Visuel) */}
              <div style={{ display: 'flex', height: '60px', width: '100%', marginBottom: '5px' }}>
                {Array.from({ length: 40 }).map((_, i) => (
                  <div key={i} style={{ width: Math.random() > 0.5 ? '2px' : '4px', height: '100%', background: 'black', marginRight: Math.random() > 0.5 ? '2px' : '4px' }}></div>
                ))}
              </div>
              
              <div style={{ fontSize: '0.85rem', color: 'black', letterSpacing: '2px', fontFamily: 'monospace' }}>
                {selectedProduct.code_barres || `84000${selectedProduct.id}10023`}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'black', marginTop: '10px' }}>
                {selectedProduct.prix_client} MAD
              </div>
            </div>

            <button onClick={handlePrint} className="btn-primary" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
              <Printer size={18} /> Lancer l'impression
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assurez-vous que votre imprimante à étiquettes (ex: Zebra, Dymo) est connectée.</p>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
            <Barcode size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>Sélectionnez un produit à gauche pour générer son étiquette.</p>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .barcode-preview, .barcode-preview * {
            visibility: visible;
          }
          .barcode-preview {
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
