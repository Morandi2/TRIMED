import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import { useState } from "react";
import { TrashBinIcon, PencilIcon, PlusIcon } from "../../icons";

const patients = [
    {
        id: 1,
        nom: "Jean",
        prenom: "Pierre",
        dateNaissance: "1990-01-01",
        email: "jean.pierre@email.com",
    },
    {
        id: 2,
        nom: "Marie",
        prenom: "Joseph",
        dateNaissance: "1985-05-12",
        email: "marie.joseph@email.com",
    },
    {
        id: 3,
        nom: "Biggy",
        prenom: "Yvener",
        dateNaissance: "1985-05-12",
        email: "marie.joseph@email.com",
    },
    {
        id: 4,
        nom: "Morandi",
        prenom: "Kendy",
        dateNaissance: "1985-05-12",
        email: "mjddj.joseph@email.com",
    },
    {
        id: 5,
        nom: "Dieuveuille",
        prenom: "Rutherford",
        dateNaissance: "1985-05-12",
        email: "marie.joseph@email.com",
    },
    // Ajoute plis pasyan si ou vle
];

// Sample JSON data for each tab
const patientContacts = [
  {
    contact_id: 1,
    patient_id: 1,
    telephone: "+509 3728-xxxx",
    email: "jean.louis@example.com",
    adresse: "12 Rue Capois",
    ville: "Port-au-Prince",
    pays: "Haïti",
  },
];
const emergencyContacts = [
  {
    emergency_id: 1,
    patient_id: 1,
    nom_complet: "Marie Louis",
    relation: "Mère",
    telephone: "+509 4412-xxxx",
    email: "marie.louis@example.com",
  },
];
const patientInsurances = [
  {
    insurance_id: 1,
    patient_id: 1,
    compagnie: "Sogebank Assurance",
    numero_police: "ASSUR-987654321",
    date_expiration: "2026-04-01",
  },
];
const medicalRecords = [
  {
    record_id: 1,
    patient_id: 1,
    antecedents: "Hypertension, appendicectomie en 2015",
    allergies: "Pénicilline",
    maladies_chroniques: "Diabète type 2",
    poids: 72.5,
    taille: 1.78,
  },
];
const labResults = [
  {
    result_id: 1,
    patient_id: 1,
    type_examen: "Analyse de sang",
    resultat: "Hémoglobine normale, glycémie élevée",
    date_exam: "2025-11-01",
    fichier_url: "https://votre-systeme.com/uploads/lab/1234.pdf",
  },
];

export default function Patient() {
    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        sexe: "",
        dateNaissance: "",
        email: "",
        phone: "",
        adresse: "",
        groupeSanguin: "",
        assurance: "",
        numeroDossier: "",
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState("");
    const [contactType, setContactType] = useState("patient_contact");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        alert("Pasyan kreye: " + JSON.stringify(form));
    };
    const openModal = (tab: string) => {
      setModalTab(tab);
      setModalOpen(true);
    };
    const closeModal = () => {
      setModalOpen(false);
    };
    return (
        <>
            <PageMeta
                title="TRIMED"
                description="TRIMED se yon platfòm jesyon sante ki vize amelyore aksè ak efikasite nan sèvis sante atravè teknoloji avanse."
            />
            <h1 className="font-bold text-4xl text-black text-center">Patient</h1>
            <div className="grid grid-cols-12 gap-4 md:gap-6 md:centered ">
                <div className="col-span-12 space-y-6 xl:col-span-12">
                    <div className="tabs tabs-lift">
                      {/* Menu Patient */}
                        <label className="tab [--tab-bg:green] ">
                            <input type="radio" name="my_tabs_4" defaultChecked />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 me-2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
                            <span className="text-lg font-bold text-black">Patient</span>
                        </label>
                        <div className="tab-content p-6" style={{ minHeight: '400px' }}>
                            <div className="overflow-x-auto w-full">
                                <table className="min-w-full bg-white dark:bg-white/[0.03] text-gray-800 dark:text-white/90 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-xs">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-800">
                                            <th className="px-6 py-4 text-lg font-bold text-gray-800 dark:text-white/90 text-left">Nom</th>
                                            <th className="px-6 py-4 text-lg font-bold text-gray-800 dark:text-white/90 text-left">Prenom</th>
                                            <th className="px-6 py-4 text-lg font-bold text-gray-800 dark:text-white/90 text-left">Date Nesans</th>
                                            <th className="px-6 py-4 text-lg font-bold text-gray-800 dark:text-white/90 text-left">Email</th>
                                            <th className="px-6 py-4 text-lg font-bold text-gray-800 dark:text-white/90 text-left">Aksyon</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patients.map((patient) => (
                                            <tr key={patient.id} className="border-b border-gray-200 dark:border-gray-800">
                                                <td className="px-6 py-4 text-lg text-gray-800 dark:text-white/90">{patient.nom}</td>
                                                <td className="px-6 py-4 text-lg text-gray-800 dark:text-white/90">{patient.prenom}</td>
                                                <td className="px-6 py-4 text-lg text-gray-800 dark:text-white/90">{patient.dateNaissance}</td>
                                                <td className="px-6 py-4 text-lg text-gray-800 dark:text-white/90">{patient.email}</td>
                                                <td className="px-6 py-4 flex gap-2">
                                                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Modifye">
                                                        <PencilIcon className="w-6 h-6 text-blue-600" />
                                                    </button>
                                                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Efase">
                                                        <TrashBinIcon className="w-6 h-6 text-red-600" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                          {/* Menu creer Patient */}
                        <label className="tab [--tab-bg:green]">
                            <input type="radio" name="my_tabs_4" />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 me-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" /></svg>
                            <span className="text-lg font-bold text-black">Creer Patient</span>
                        </label>
                        <div className="tab-content bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-6 relative rounded-2xl shadow-theme-xs">
                          <form className="space-y-4 max-w-lg mx-auto" onSubmit={handleSubmit}>
                                <Input name="nom" placeholder="Non" value={form.nom} onChange={handleChange} className="dark:bg-gray-900 dark:text-white/90" />
                                <Input name="prenom" placeholder="Prenom" value={form.prenom} onChange={handleChange} className="dark:bg-gray-900 dark:text-white/90" />
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block mb-1 text-gray-800 dark:text-white/90 font-semibold">Sexe</label>
                                        <select name="sexe" value={form.sexe} onChange={handleSelectChange} className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 bg-white dark:bg-gray-900 shadow-theme-xs">
                                            <option value="">Chwazi</option>
                                            <option value="M">Masculin</option>
                                            <option value="F">Feminin</option>
                                        </select>
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block mb-1 text-gray-800 dark:text-white/90 font-semibold">Date Nesans</label>
                                        <Input name="dateNaissance" type="date" value={form.dateNaissance} onChange={handleChange} className="dark:bg-gray-900 dark:text-white/90" />
                                    </div>
                                </div>
                                <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="dark:bg-gray-900 dark:text-white/90" />
                                <Input name="phone" type="tel" placeholder="Telefòn" value={form.phone} onChange={handleChange} className="dark:bg-gray-900 dark:text-white/90" />
                                <Input name="adresse" placeholder="Adrès" value={form.adresse} onChange={handleChange} className="dark:bg-gray-900 dark:text-white/90" />
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block mb-1 text-gray-800 dark:text-white/90 font-semibold">Groupe Sanguin</label>
                                        <select name="groupeSanguin" value={form.groupeSanguin} onChange={handleSelectChange} className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 bg-white dark:bg-gray-900 shadow-theme-xs">
                                            <option value="">Chwazi</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block mb-1 text-gray-800 dark:text-white/90 font-semibold">Assurance</label>
                                        <select name="assurance" value={form.assurance} onChange={handleSelectChange} className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 bg-white dark:bg-gray-900 shadow-theme-xs">
                                            <option value="">Chwazi</option>
                                            <option value="Oui">Oui</option>
                                            <option value="Non">Non</option>
                                        </select>
                                    </div>
                                </div>
                                <Input name="numeroDossier" placeholder="Nimewo Dossier" value={form.numeroDossier} onChange={handleChange} className="dark:bg-gray-900 dark:text-white/90" />
                                <button type="submit" className="btn text-theme-sm hover:bg-brand-600 w-full rounded-lg bg-brand-500 text-white py-2.5 font-medium shadow-theme-xs">Creer Patient</button>
                            </form>
                        </div>
                            {/* Menu contact */}
                        <label className="tab [--tab-bg:green]">
                            <input type="radio" name="my_tabs_4" />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 me-2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                            <span className="text-lg font-bold text-black">Contact</span>
                        </label>
                        <div className="tab-content bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-6 relative rounded-2xl shadow-theme-xs">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <select
                                value={contactType}
                                onChange={(e) => setContactType(e.target.value)}
                                className="h-10 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-800 dark:text-white/90 bg-white dark:bg-gray-900 shadow-theme-xs"
                              >
                                <option value="patient_contact">Patient Contact</option>
                                <option value="emergency_contacts">Emergency Contacts</option>
                              </select>
                            </div>
                            <button
                              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg shadow-theme-xs"
                              onClick={() => openModal(contactType)}
                            >
                              <PlusIcon className="w-5 h-5" />
                              Ajoute
                            </button>
                          </div>
                          <div className="overflow-x-auto w-full">
                            <table className="min-w-full bg-white dark:bg-white/[0.03] text-gray-800 dark:text-white/90 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-xs">
                              <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800">
                                  {Object.keys(contactType === "patient_contact" ? patientContacts[0] : emergencyContacts[0]).map((key) => (
                                    <th key={key} className="px-4 py-2 text-gray-800 dark:text-white/90 font-bold text-left">{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {(contactType === "patient_contact" ? patientContacts : emergencyContacts).map((row, idx) => (
                                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-800">
                                    {Object.values(row).map((val, i) => (
                                      <td key={i} className="px-4 py-2 text-gray-800 dark:text-white/90">{val}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Modal for Contact - styled for dark mode and uniformity */}
                          {modalOpen && contactType === "patient_contact" && (
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
                              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-theme-xs">
                                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white/90">Ajoute Patient Contact</h2>
                                <form>
                                  <Input name="telephone" placeholder="Téléphone" className="mb-2" />
                                  <Input name="email" placeholder="Email" className="mb-2" />
                                  <Input name="adresse" placeholder="Adresse" className="mb-2" />
                                  <Input name="ville" placeholder="Ville" className="mb-2" />
                                  <Input name="pays" placeholder="Pays" className="mb-2" />
                                  <div className="flex justify-end mt-4 gap-2">
                                    <button type="button" className="flex justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]" onClick={closeModal}>Anile</button>
                                    <button type="submit" className="btn btn-success flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">Sove</button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          )}
                          {modalOpen && contactType === "emergency_contacts" && (
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
                              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-theme-xs">
                                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white/90">Ajoute Emergency Contact</h2>
                                <form>
                                  <Input name="nom_complet" placeholder="Non konplè" className="mb-2" />
                                  <Input name="relation" placeholder="Relasyon" className="mb-2" />
                                  <Input name="telephone" placeholder="Téléphone" className="mb-2" />
                                  <Input name="email" placeholder="Email" className="mb-2" />
                                  <div className="flex justify-end mt-4 gap-2">
                                    <button type="button" className="flex justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]" onClick={closeModal}>Anile</button>
                                    <button type="submit" className="btn btn-success flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600">Sove</button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                          {/* Menu Assurance */}
                         <label className="tab [--tab-bg:green]">
                            <input type="radio" name="my_tabs_4" />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 me-2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                            <span className="text-lg font-bold text-black">Assurance</span>
                        </label>
                        <div className="tab-content bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-6 relative rounded-2xl shadow-theme-xs">
                          <div className="flex items-center justify-between mb-4">
                            <button
                              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg shadow-theme-xs"
                              onClick={() => openModal("assurance")}
                            >
                              <PlusIcon className="w-5 h-5" />
                              Ajoute
                            </button>
                          </div>
                          <div className="overflow-x-auto w-full">
                            <table className="min-w-full bg-white dark:bg-white/[0.03] text-gray-800 dark:text-white/90 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-xs">
                              <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800">
                                  {Object.keys(patientInsurances[0]).map((key) => (
                                    <th key={key} className="px-4 py-2 text-gray-800 dark:text-white/90 font-bold text-left">{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {patientInsurances.map((row, idx) => (
                                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-800">
                                    {Object.values(row).map((val, i) => (
                                      <td key={i} className="px-4 py-2 text-gray-800 dark:text-white/90">{val}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Modal for Assurance - now absolute inside tab-content */}
                          {modalOpen && modalTab === "assurance" && (
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
                              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-theme-xs">
                                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white/90">Ajoute Assurance</h2>
                                <form>
                                  <Input name="compagnie" placeholder="Compagnie" />
                                  <Input name="numero_police" placeholder="Numéro police" />
                                  <Input name="date_expiration" type="date" placeholder="Date expiration" />
                                  <div className="flex justify-end mt-4">
                                    <button type="button" className="btn mr-2" onClick={closeModal}>Anile</button>
                                    <button type="submit" className="btn btn-primary">Sove</button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Menu Dossier Medical */}
                        <label className="tab [--tab-bg:green]">
                            <input type="radio" name="my_tabs_4" />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 me-2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                            <span className="text-lg font-bold text-black">Dossier Medical</span>
                        </label>
                        <div className="tab-content bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-6 relative rounded-2xl shadow-theme-xs">
                          <div className="flex items-center justify-between mb-4">
                            <button
                              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg shadow-theme-xs"
                              onClick={() => openModal("dossier_medical")}
                            >
                              <PlusIcon className="w-5 h-5" />
                              Ajoute
                            </button>
                          </div>
                          <div className="overflow-x-auto w-full">
                            <table className="min-w-full bg-white dark:bg-white/[0.03] text-gray-800 dark:text-white/90 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-xs">
                              <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800">
                                  {Object.keys(medicalRecords[0]).map((key) => (
                                    <th key={key} className="px-4 py-2 text-gray-800 dark:text-white/90 font-bold text-left">{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {medicalRecords.map((row, idx) => (
                                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-800">
                                    {Object.values(row).map((val, i) => (
                                      <td key={i} className="px-4 py-2 text-gray-800 dark:text-white/90">{val}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Modal for Dossier Medical - now absolute inside tab-content */}
                          {modalOpen && modalTab === "dossier_medical" && (
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
                              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-theme-xs">
                                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white/90">Ajoute Dossier Medical</h2>
                                <form>
                                  <Input name="antecedents" placeholder="Antécédents" />
                                  <Input name="allergies" placeholder="Allergies" />
                                  <Input name="maladies_chroniques" placeholder="Maladies chroniques" />
                                  <Input name="poids" type="number" placeholder="Poids (kg)" />
                                  <Input name="taille" type="number" placeholder="Taille (m)" />
                                  <div className="flex justify-end mt-4">
                                    <button type="button" className="btn mr-2" onClick={closeModal}>Anile</button>
                                    <button type="submit" className="btn btn-primary">Sove</button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Menu Resultat Laboratoire */}
                        <label className="tab [--tab-bg:green]">
                            <input type="radio" name="my_tabs_4" />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 me-2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
                            <span className="text-lg font-bold text-black">Resultat Laboratoire</span>
                        </label>
                        <div className="tab-content bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 p-6 relative rounded-2xl shadow-theme-xs">
                          <div className="flex items-center justify-between mb-4">
                            <button
                              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg shadow-theme-xs"
                              onClick={() => openModal("lab_result")}
                            >
                              <PlusIcon className="w-5 h-5" />
                              Ajoute
                            </button>
                          </div>
                          <div className="overflow-x-auto w-full">
                            <table className="min-w-full bg-white dark:bg-white/[0.03] text-gray-800 dark:text-white/90 rounded-xl border border-gray-200 dark:border-gray-800 shadow-theme-xs">
                              <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800">
                                  {Object.keys(labResults[0]).map((key) => (
                                    <th key={key} className="px-4 py-2 text-gray-800 dark:text-white/90 font-bold text-left">{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {labResults.map((row, idx) => (
                                  <tr key={idx} className="border-b border-gray-200 dark:border-gray-800">
                                    {Object.values(row).map((val, i) => (
                                      <td key={i} className="px-4 py-2 text-gray-800 dark:text-white/90">{val}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Modal for Lab Result - now absolute inside tab-content */}
                          {modalOpen && modalTab === "lab_result" && (
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
                              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-theme-xs">
                                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white/90">Ajoute Resultat Laboratoire</h2>
                                <form>
                                  <Input name="type_examen" placeholder="Type examen" />
                                  <Input name="resultat" placeholder="Resultat" />
                                  <Input name="date_exam" type="date" placeholder="Date examen" />
                                  <Input name="fichier_url" placeholder="Fichier URL" />
                                  <div className="flex justify-end mt-4">
                                    <button type="button" className="btn mr-2" onClick={closeModal}>Anile</button>
                                    <button type="submit" className="btn btn-primary">Sove</button>
                                  </div>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                         
                    </div>
                </div>
            </div>
        </>
    );
}
