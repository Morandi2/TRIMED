import { useState, useEffect } from "react";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { abonnementService } from "../GestionAbonnements/services/AbonnementService";
import { couponService } from "../GestionCoupons/services/CouponService";
import { DemoModeBanner } from "../../../components/shared/DemoModeBanner";

// Types pour tenant
interface TenantSubscription {
  abonnement_id: number;
  plan_id: number;
  date_debut: string;
  date_fin: string;
  statut_id: number;
  statut_nom: string;
}

interface TenantPayment {
  paiement_id: number;
  montant: number;
  methode_nom: string;
  date_paiement: string;
  statut_nom: string;
  reference?: string;
}

interface PaymentFormData {
  montant: number;
  methode_id: number;
  reference?: string;
  phoneNumber?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  email?: string;
  bankName?: string;
  accountNumber?: string;
}

interface TenantPaiementModuleProps {
  tenantId: number;
  hopitalNom?: string;
  currentPlan?: string;
}

const PLANS = [
  {
    id: 1,
    name: 'Plan Basique',
    price: 5000,
    currency: 'HTG',
    features: ['5 utilisateurs', 'Gestion patients', 'Support email'],
    color: 'blue',
    gradient: 'from-blue-600 to-blue-700',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  {
    id: 2,
    name: 'Plan Professionnel',
    price: 12000,
    currency: 'HTG',
    features: ['20 utilisateurs', 'Rapports avancés', 'Support prioritaire'],
    color: 'green',
    gradient: 'from-green-600 to-green-700',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    popular: true
  },
  {
    id: 3,
    name: 'Plan Enterprise',
    price: 25000,
    currency: 'HTG',
    features: ['Utilisateurs illimités', 'API personnalisée', 'Support 24/7'],
    color: 'amber',
    gradient: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300'
  }
];

const PAYMENT_METHODS = [
  { id: 1, name: 'MonCash', type: 'mobile_money', icon: '', fields: ['phoneNumber'] },
  { id: 2, name: 'NatCash', type: 'mobile_money', icon: '', fields: ['phoneNumber'] },
  { id: 3, name: 'Visa', type: 'card', icon: '', fields: ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'] },
  { id: 4, name: 'MasterCard', type: 'card', icon: '', fields: ['cardNumber', 'cardHolder', 'expiryDate', 'cvv'] },
  { id: 5, name: 'PayPal', type: 'paypal', icon: '', fields: ['email'] },
  { id: 6, name: 'Virement Bancaire', type: 'bank', icon: '', fields: ['bankName', 'accountNumber'] }
];

const BANK_FORMATS = {
  'Unibank': { pattern: /^\d{10}$/, placeholder: '1234567890' },
  'BNC': { pattern: /^\d{8}$/, placeholder: '12345678' },
  'Sogebank': { pattern: /^\d{12}$/, placeholder: '123456789012' },
  'Capital Bank': { pattern: /^\d{9}$/, placeholder: '123456789' }
};

export default function TenantPaiementModule({ tenantId, hopitalNom }: TenantPaiementModuleProps) {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `...`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);


  const [subscription, setSubscription] = useState<TenantSubscription | null>(null);
  const [payments, setPayments] = useState<TenantPayment[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedMethod] = useState<any>(null);
  const [formData, setFormData] = useState<PaymentFormData>({ montant: 0, methode_id: 1 });
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    loadTenantData();
  }, [tenantId]);

  const loadTenantData = async () => {
    try {
      // Charger abonnement actuel
      const abonnements = await abonnementService.obtenirTousAbonnements(tenantId);
      const currentSub = abonnements[0]; // Dernier abonnement

      if (currentSub) {
        const statuts = abonnementService.obtenirStatutsAbonnement();
        const statutNom = statuts.find(s => s.statut_id === currentSub.statut_id)?.nom || 'Inconnu';

        setSubscription({
          ...currentSub,
          statut_nom: statutNom
        });

        // Charger historique paiements sèlman si nou gen yon abonnement
        const allPaiements = await abonnementService.obtenirPaiementsParAbonnement(currentSub.abonnement_id);
        const methodes = abonnementService.obtenirMethodesPaiement();
        const statutsPaiement = abonnementService.obtenirStatutsPaiement();

        const paymentsWithNames = allPaiements.map(p => ({
          ...p,
          methode_nom: methodes.find(m => m.methode_id === p.methode_id)?.nom || 'Inconnu',
          statut_nom: statutsPaiement.find(s => s.statut_id === p.statut_id)?.nom || 'Inconnu'
        }));

        setPayments(paymentsWithNames);
      } else {
        setSubscription(null);
        setPayments([]);
      }
    } catch (error) {
      console.error("Erreur chargement données tenant:", error);
    }
  };

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setFormData({ ...formData, montant: plan.price });
    setShowUpgradeModal(false);
    setShowPaymentModal(true);
  };

  const handleRenewPlan = () => {
    setSelectedPlan(currentPlanData);
    setFormData({ ...formData, montant: currentPlanData.price });
    setShowRenewModal(true);
  };

  // Removed unused handleMethodSelect

  const processPayment = async () => {
    if (!selectedPlan || !selectedMethod) return;

    setIsProcessing(true);

    try {
      // Simuler paiement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Créer nouveau paiement
      const result = await abonnementService.creerPaiement({
        tenant_id: tenantId,
        abonnement_id: subscription?.abonnement_id || 0,
        montant: formData.montant,
        methode_id: formData.methode_id,
        date_paiement: new Date().toISOString(),
        statut_id: 1, // Payé
        reference: formData.reference
      });

      if (result.success) {
        // Utiliser coupon si fourni
        if (couponCode) {
          const coupons = couponService.obtenirTousCoupons();
          const coupon = coupons.find(c => c.code === couponCode && c.actif);
          if (coupon) {
            couponService.utiliserCoupon(coupon.coupon_id, tenantId);
          }
        }

        loadTenantData();
        setShowPaymentModal(false);
        alert('Paiement effectué avec succès!');
      }
    } catch (error) {
      alert('Erreur lors du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-HT', {
      style: 'currency',
      currency: 'HTG'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actif': return 'success';
      case 'Expiré': return 'error';
      case 'Suspendu': return 'warning';
      case 'Payé': return 'success';
      case 'En attente': return 'warning';
      case 'Échoué': return 'error';
      default: return 'primary';
    }
  };

  const currentPlanData = PLANS.find(p => p.id === subscription?.plan_id) || PLANS[2]; // Default to Enterprise
  const nextPaymentDate = subscription ? new Date(subscription.date_fin) : new Date();

  return (
    <div className="space-y-6">
      <DemoModeBanner
        module="Paiements & Abonnements"
        message="Ce module utilise des données de démonstration : le backend n'expose pas encore les endpoints de facturation. Les paiements ne sont pas réellement enregistrés."
      />

      {/* En-tête avec info abonnement */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plan Actuel</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{currentPlanData.name}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Statut</p>
              <Badge size="sm" color={getStatusColor(subscription?.statut_nom || 'Inconnu')}>
                {subscription?.statut_nom || 'Aucun'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prochain Paiement</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDate(nextPaymentDate.toISOString())}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prix Mensuel</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatAmount(currentPlanData.price)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions principales */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Abonnement et Paiements - {hopitalNom || "Mon Hôpital"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez votre abonnement et vos paiements
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Changer de Plan
            </button>

            <button
              onClick={handleRenewPlan}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Renouveler
            </button>
          </div>
        </div>

        {/* Plan actuel */}
        <div className={`mb-6 rounded-lg border ${currentPlanData.borderColor} ${currentPlanData.bgColor} dark:bg-gray-800 dark:border-gray-600 p-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${currentPlanData.gradient} flex items-center justify-center text-white font-bold`}>
                {currentPlanData.name.charAt(0)}
              </div>
              <div>
                <h4 className={`font-semibold ${currentPlanData.textColor} dark:text-white`}>{currentPlanData.name}</h4>
                <p className={`text-sm ${currentPlanData.textColor} dark:text-gray-300`}>
                  {formatAmount(currentPlanData.price)}/mois
                </p>
              </div>
            </div>
            <Badge color="success" size="sm">Plan Actuel</Badge>
          </div>
          <ul className="mt-3 space-y-1">
            {currentPlanData.features.map((feature, index) => (
              <li key={index} className={`flex items-center gap-2 text-sm ${currentPlanData.textColor} dark:text-gray-300`}>
                <svg className={`h-4 w-4 text-${currentPlanData.color}-600 dark:text-${currentPlanData.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Historique des paiements */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">
            Historique des Paiements
          </h4>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Référence
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Montant
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Méthode
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Date
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    Statut
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {payments.map((payment) => (
                  <TableRow key={payment.paiement_id}>
                    <TableCell className="py-3">
                      <p className="font-medium text-black text-sm dark:text-white/90">
                        {payment.reference || `PAY-${payment.paiement_id}`}
                      </p>
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="font-semibold text-black text-sm dark:text-white/90">
                        {formatAmount(payment.montant)}
                      </p>
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="text-black text-sm dark:text-white/90">
                        {payment.methode_nom}
                      </p>
                    </TableCell>
                    <TableCell className="py-3">
                      <p className="text-black text-sm dark:text-white/90">
                        {formatDate(payment.date_paiement)}
                      </p>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge size="sm" color={getStatusColor(payment.statut_nom)}>
                        {payment.statut_nom}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {payments.length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun paiement</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Aucun paiement n'a été effectué pour le moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal changement de plan */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="w-full max-w-6xl max-h-[95vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Choisir un Plan
              </h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
                {PLANS.map((plan) => (
                  <div key={plan.id} className={`relative rounded-lg border-2 p-3 sm:p-4 transition-all duration-300 bg-white dark:bg-gray-800 dark:border-gray-600 ${plan.popular
                    ? `${plan.borderColor} dark:border-green-500 shadow-lg hover:shadow-xl glitch-card`
                    : `${plan.borderColor} hover:shadow-lg hover:-translate-y-1`
                    }`}>
                    {plan.popular && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <Badge color="success" size="sm">Recommandé</Badge>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {plan.name.charAt(0)}
                      </div>
                      <h5 className={`text-sm font-semibold ${plan.textColor} dark:text-white`}>
                        {plan.name}
                      </h5>
                    </div>

                    <div className="mb-3">
                      <span className={`text-xl font-bold ${plan.textColor} dark:text-white`}>
                        {formatAmount(plan.price)}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">/mois</span>
                    </div>

                    <ul className="space-y-1 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-1 text-xs">
                          <svg className={`h-3 w-3 text-${plan.color}-600 dark:text-${plan.color}-400 flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePlanSelect(plan)}
                      className={`w-full rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 bg-gradient-to-r ${plan.gradient} text-white hover:shadow-lg hover:-translate-y-1`}
                    >
                      Sélectionner
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal paiement */}
      {(showPaymentModal || showRenewModal) && selectedPlan && (
        <PaymentModal
          plan={selectedPlan || currentPlanData}
          onClose={() => {
            setShowPaymentModal(false);
            setShowRenewModal(false);
          }}
          onPayment={processPayment}
          isProcessing={isProcessing}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          formData={formData}
          setFormData={setFormData}
        />
      )}


    </div>
  );
}

// Composant Modal de Paiement
function PaymentModal({ plan, onClose, onPayment, isProcessing, couponCode, setCouponCode, formData, setFormData }: any) {
  const selectedMethod = PAYMENT_METHODS.find(m => m.id === formData.methode_id);
  const selectedBank = formData.bankName;
  const bankFormat = selectedBank ? BANK_FORMATS[selectedBank as keyof typeof BANK_FORMATS] : null;

  const formatAccountNumber = (value: string, bank: string) => {
    const format = BANK_FORMATS[bank as keyof typeof BANK_FORMATS];
    if (!format) return value;

    const cleaned = value.replace(/\D/g, '');
    return cleaned.slice(0, format.placeholder.length);
  };

  const renderPaymentFields = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod.type) {
      case 'mobile_money':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Numéro de téléphone *
            </label>
            <input
              type="tel"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+509 48 12 34 56"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
              required
            />
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de carte *
              </label>
              <input
                type="text"
                value={formData.cardNumber || ''}
                onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                placeholder="1234 5678 9012 3456"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du titulaire *
              </label>
              <input
                type="text"
                value={formData.cardHolder || ''}
                onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value })}
                placeholder="JEAN DUPONT"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date d'expiration *
                </label>
                <input
                  type="text"
                  value={formData.expiryDate || ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  placeholder="MM/AA"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CVV *
                </label>
                <input
                  type="text"
                  value={formData.cvv || ''}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                  placeholder="123"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'paypal':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email PayPal *
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="votre@email.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
              required
            />
          </div>
        );

      case 'bank':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Banque *
              </label>
              <select
                value={formData.bankName || ''}
                onChange={(e) => {
                  setFormData({ ...formData, bankName: e.target.value, accountNumber: '' });
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Sélectionnez votre banque</option>
                <option value="Unibank">Unibank</option>
                <option value="BNC">BNC</option>
                <option value="Sogebank">Sogebank</option>
                <option value="Capital Bank">Capital Bank</option>
              </select>
            </div>
            {selectedBank && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro de compte * ({bankFormat?.placeholder.length} chiffres)
                </label>
                <input
                  type="text"
                  value={formData.accountNumber || ''}
                  onChange={(e) => {
                    const formatted = formatAccountNumber(e.target.value, selectedBank);
                    setFormData({ ...formData, accountNumber: formatted });
                  }}
                  placeholder={bankFormat?.placeholder || 'Numéro de compte'}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                  required
                />
                {bankFormat && formData.accountNumber && !bankFormat.pattern.test(formData.accountNumber) && (
                  <p className="text-xs text-red-600 mt-1">
                    Format invalide pour {selectedBank}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header fixe */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Paiement - {plan.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Body scrollable */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Plan:</span>
              <span className="font-medium">{plan.name}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t pt-2 mt-2 text-gray-900 dark:text-white">
              <span>Total:</span>
              <span>{new Intl.NumberFormat('fr-HT', { style: 'currency', currency: 'HTG' }).format(plan.price)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code Coupon (optionnel)</label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Entrez votre code coupon"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Méthode de paiement</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setFormData({ ...formData, methode_id: method.id })}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${formData.methode_id === method.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                    }`}
                >
                  <span className="text-lg">{method.icon}</span>
                  <span className="text-xs font-medium">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {renderPaymentFields()}

        </div>

        {/* Footer fixe */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onPayment}
            disabled={isProcessing}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {isProcessing ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Traitement...
              </>
            ) : (
              `Payer ${new Intl.NumberFormat('fr-HT', { style: 'currency', currency: 'HTG' }).format(plan.price)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}