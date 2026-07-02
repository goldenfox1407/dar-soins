import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function Faq() {
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
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-[#1E293B] selection:bg-blue-500/30">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4 w-full">
        <div className="text-center mb-16 animate-fade-in">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-4xl font-extrabold mb-4 text-[#1E293B]">Foire Aux Questions</h1>
          <p className="text-slate-600 text-lg">Vous avez des questions ? Nous avons les réponses.</p>
        </div>

        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <summary className="flex items-center justify-between cursor-pointer p-6 font-semibold text-lg text-slate-800 hover:bg-slate-50 transition-colors list-none">
                {faq.q}
                <ChevronDown className="text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
