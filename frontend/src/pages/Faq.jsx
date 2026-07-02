import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "Comment réserver un soin à domicile ?",
      a: "Il suffit de créer un compte Patient, de cliquer sur 'Demander un soin', de sélectionner le type de soin désiré et de partager votre position. Un infirmier vous sera affecté en quelques minutes."
    },
    {
      q: "Les infirmiers sont-ils certifiés ?",
      a: "Absolument. Tous nos infirmiers sont diplômés d'État et font l'objet d'une vérification rigoureuse de leurs antécédents et de leurs compétences avant d'intégrer notre réseau."
    },
    {
      q: "Quels sont les tarifs ?",
      a: "Les tarifs dépendent du type de soin (Injection, Pansement, Garde). Vous pouvez consulter la liste des tarifs estimatifs sur notre page Services. Le prix définitif vous est toujours communiqué avant confirmation."
    },
    {
      q: "Est-il possible d'avoir le même infirmier pour plusieurs jours ?",
      a: "Oui, pour les soins récurrents ou les gardes-malades de longue durée, nous faisons le maximum pour vous assigner la même équipe afin d'assurer un meilleur suivi et confort."
    },
    {
      q: "Comment fonctionne le paiement ?",
      a: "Le paiement est effectué directement auprès de l'infirmier à la fin de l'intervention. Nous acceptons les espèces, le paiement par carte et par virement bancaire."
    },
    {
      q: "Que faire en cas d'urgence ?",
      a: "Dar-Soins n'est pas un service d'urgence. En cas d'urgence vitale, veuillez appeler le SAMU (150) ou le 141. Nous proposons des soins planifiés à domicile dans un cadre non-urgentiste."
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 max-w-3xl mx-auto px-4 w-full">
        <div className="text-center mb-16 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <HelpCircle size={30} />
          </div>
          <h1 className="text-4xl font-extrabold mb-4 text-[#1E293B]">Foire Aux Questions</h1>
          <p className="text-slate-600 text-lg">Vous avez des questions ? Nous avons les réponses.</p>
        </div>

        <div className="space-y-3 animate-slide-up delay-200">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === i ? 'border-blue-200 shadow-md shadow-blue-100/50' : 'border-slate-200 shadow-sm hover:shadow-md'}`}
            >
              <button 
                onClick={() => toggleFaq(i)}
                className="w-full flex items-center justify-between cursor-pointer p-6 font-semibold text-left text-slate-800 hover:bg-slate-50/50 transition-colors bg-transparent border-none text-base"
              >
                <span className="pr-4">{faq.q}</span>
                <ChevronDown 
                  className={`text-slate-400 shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-blue-500' : ''}`} 
                  size={20}
                />
              </button>
              <div 
                className="overflow-hidden transition-all duration-300"
                style={{ 
                  maxHeight: openIndex === i ? '200px' : '0px',
                  opacity: openIndex === i ? 1 : 0
                }}
              >
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-10 border border-blue-100 animate-slide-up delay-400">
          <MessageCircle className="text-blue-500 mx-auto mb-4" size={32} />
          <h3 className="text-xl font-bold text-slate-800 mb-3">Vous ne trouvez pas votre réponse ?</h3>
          <p className="text-slate-600 mb-6 text-sm">Notre équipe est disponible pour vous aider personnellement.</p>
          <Link 
            to="/contact" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all no-underline shadow-lg shadow-blue-500/25 hover:-translate-y-0.5"
          >
            Nous Contacter
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
