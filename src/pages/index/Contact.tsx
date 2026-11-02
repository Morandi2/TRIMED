import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import EnTete from './portail/EnTete';
import PiedDePage from './portail/PiedDePage';
import { CONTACT } from './portail/contenu';

// Le formulaire ouvre la messagerie du visiteur avec un message prérempli : aucune demande ne se perd
// sur un serveur qui n’existe pas, et la page s’héberge n’importe où.
const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', structure: '', message: '' });
  const [ouverte, setOuverte] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sujet = `Demande de démonstration TRIMED${formData.structure ? ` pour ${formData.structure}` : ''}`;
    const corps = `${formData.message}\n\n${formData.name}\n${formData.email}${formData.structure ? `\n${formData.structure}` : ''}`;
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
    setOuverte(true);
  };

  const champ = 'w-full rounded-2xl border border-trimed-indigo/15 bg-white/85 px-4 py-3 text-trimed-encre outline-none transition focus:border-trimed-indigo focus:ring-4 focus:ring-trimed-indigo/15';
  const etiquette = 'mb-2 block text-sm font-medium text-trimed-encre';

  return (
    <div className="ptl min-h-screen">
      <EnTete accueil={false} />
      <main className="ptl-contenu ptl-cadre pb-20 pt-32">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <p className="ptl-surtitre justify-center">Contact</p>
          <h1 className="ptl-titre ptl-titre--l mt-4">Parlons de votre hôpital.</h1>
          <p className="ptl-texte mx-auto mt-4">Une question, un projet de mise en service ? Écrivez-nous : nous vous présentons TRIMED avec les situations de votre établissement.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <ul className="grid content-start gap-4">
            <li className="ptl-verre flex items-start gap-4 p-6">
              <span className="ptl-icone"><Mail className="h-5 w-5" aria-hidden="true" /></span>
              <div>
                <h2 className="font-medium text-trimed-encre">E-mail</h2>
                <a href={`mailto:${CONTACT.email}`} className="text-trimed-indigo hover:underline">{CONTACT.email}</a>
              </div>
            </li>
            <li className="ptl-verre flex items-start gap-4 p-6">
              <span className="ptl-icone"><Phone className="h-5 w-5" aria-hidden="true" /></span>
              <div>
                <h2 className="font-medium text-trimed-encre">Téléphone</h2>
                {CONTACT.telephones.map((t) => (
                  <a key={t} href={`tel:${t.replace(/\s/g, '')}`} className="block text-trimed-encre-douce hover:text-trimed-indigo">{t}</a>
                ))}
              </div>
            </li>
            <li className="ptl-verre flex items-start gap-4 p-6">
              <span className="ptl-icone"><MapPin className="h-5 w-5" aria-hidden="true" /></span>
              <div>
                <h2 className="font-medium text-trimed-encre">Bureau</h2>
                <p className="text-trimed-encre-douce">Port-au-Prince, Haïti</p>
              </div>
            </li>
          </ul>

          <div className="ptl-verre ptl-verre--fort p-7 sm:p-10 lg:col-span-2">
            {ouverte ? (
              <div className="py-6 text-center" role="status">
                <h2 className="ptl-titre ptl-titre--m">Votre messagerie s’est ouverte.</h2>
                <p className="ptl-texte mx-auto mt-3">Votre demande y est déjà rédigée : il ne reste qu’à l’envoyer. Si rien ne s’est ouvert, écrivez-nous directement à <a href={`mailto:${CONTACT.email}`} className="text-trimed-indigo underline">{CONTACT.email}</a>.</p>
                <button type="button" onClick={() => setOuverte(false)} className="ptl-bouton-clair mt-8">Revenir au formulaire</button>
              </div>
            ) : (
              <form className="grid gap-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="contact-nom" className={etiquette}>Prénom et nom <span className="text-red-600" aria-hidden="true">*</span></label>
                    <input id="contact-nom" type="text" required autoComplete="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={champ} />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className={etiquette}>E-mail <span className="text-red-600" aria-hidden="true">*</span></label>
                    <input id="contact-email" type="email" required autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={champ} />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-structure" className={etiquette}>Établissement</label>
                  <input id="contact-structure" type="text" autoComplete="organization" value={formData.structure} onChange={(e) => setFormData({ ...formData, structure: e.target.value })} placeholder="Hôpital, clinique, centre de santé" className={champ} />
                </div>
                <div>
                  <label htmlFor="contact-message" className={etiquette}>Votre message <span className="text-red-600" aria-hidden="true">*</span></label>
                  <textarea id="contact-message" rows={6} required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Dites-nous comment nous pouvons vous aider." className={champ} />
                </div>
                <button type="submit" className="ptl-bouton w-full">Préparer le message <Send className="h-4 w-4" aria-hidden="true" /></button>
                <p className="text-center text-xs text-trimed-encre-douce">Le bouton ouvre votre messagerie avec le message déjà rédigé.</p>
              </form>
            )}
          </div>
        </div>
      </main>
      <PiedDePage accueil={false} />
    </div>
  );
};

export default Contact;
