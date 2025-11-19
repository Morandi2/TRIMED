// components/payment/PaymentModule.tsx
import { useState, useEffect } from "react";
import Badge from "../../../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

// Entèfas yo
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank_transfer' | 'card' | 'paypal';
  logo: string;
  status: 'active' | 'inactive';
  fees: number;
  description: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: 'monthly' | 'yearly';
  features: string[];
  isPopular: boolean;
}

export interface PaymentTransaction {
  id: string;
  reference: string;
  adminId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  phoneNumber?: string;
  cardLastFour?: string;
  cardType?: string;
}

export interface PaymentFormData {
  phoneNumber?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  cardType?: string;
  bankName?: string;
  accountNumber?: string;
  paypalEmail?: string;
}

// Done mock
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'moncash',
    name: 'MonCash',
    type: 'mobile_money',
    logo: '💳',
    status: 'active',
    fees: 1.5,
    description: 'Paiement mobile via MonCash'
  },
  {
    id: 'natcash',
    name: 'NatCash',
    type: 'mobile_money',
    logo: '📱',
    status: 'active',
    fees: 1.5,
    description: 'Paiement mobile via NatCash'
  },
  {
    id: 'unibank',
    name: 'Unibank',
    type: 'bank_transfer',
    logo: '🏦',
    status: 'active',
    fees: 1.0,
    description: 'Transfert bancaire Unibank'
  },
  {
    id: 'bnc',
    name: 'BNC',
    type: 'bank_transfer',
    logo: '💰',
    status: 'active',
    fees: 1.0,
    description: 'Transfert bancaire BNC'
  },
  {
    id: 'credit_card',
    name: 'Carte de Crédit',
    type: 'card',
    logo: '💳',
    status: 'active',
    fees: 2.5,
    description: 'Paiement par carte de crédit'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'paypal',
    logo: '🔵',
    status: 'active',
    fees: 3.0,
    description: 'Paiement sécurisé via PayPal'
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Plan Basique',
    description: 'Parfait pour les petites cliniques',
    price: 5000,
    currency: 'HTG',
    duration: 'monthly',
    features: [
      'Jusqu\'à 5 utilisateurs',
      'Gestion des patients',
      'Rendez-vous basiques',
      'Support par email',
      'Stockage 5GB'
    ],
    isPopular: false
  },
  {
    id: 'professional',
    name: 'Plan Professionnel',
    description: 'Idéal pour les hôpitaux moyens',
    price: 12000,
    currency: 'HTG',
    duration: 'monthly',
    features: [
      'Jusqu\'à 20 utilisateurs',
      'Toutes les fonctionnalités Basique',
      'Rapports avancés',
      'Support prioritaire',
      'Stockage 50GB',
      'Intégration labo'
    ],
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Plan Enterprise',
    description: 'Pour les grands hôpitaux',
    price: 25000,
    currency: 'HTG',
    duration: 'monthly',
    features: [
      'Utilisateurs illimités',
      'Toutes les fonctionnalités Pro',
      'API personnalisée',
      'Support 24/7',
      'Stockage 500GB',
      'Formation personnalisée'
    ],
    isPopular: false
  }
];

const CARD_TYPES = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'MasterCard' },
  { value: 'american_express', label: 'American Express' },
  { value: 'discover', label: 'Discover' }
];

interface PaymentModuleProps {
  adminId: number;
  currentPlan?: string;
}

export default function PaymentModule({ adminId, currentPlan = 'basic' }: PaymentModuleProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([]);
  const [modalType, setModalType] = useState<'plan' | 'payment' | 'form' | 'success' | 'history' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({});

  // Chaje istorik peman yo
  useEffect(() => {
    loadPaymentHistory();
  }, [adminId]);

  const loadPaymentHistory = () => {
    const mockHistory: PaymentTransaction[] = [
      {
        id: '1',
        reference: 'PAY-2024-001',
        adminId: adminId,
        amount: 5000,
        currency: 'HTG',
        paymentMethod: 'moncash',
        status: 'completed',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        phoneNumber: '+509 48 11 22 33'
      },
      {
        id: '2',
        reference: 'PAY-2024-002',
        adminId: adminId,
        amount: 12000,
        currency: 'HTG',
        paymentMethod: 'unibank',
        status: 'completed',
        createdAt: '2024-02-15',
        updatedAt: '2024-02-15'
      }
    ];
    setPaymentHistory(mockHistory);
  };

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setModalType('payment');
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setFormData({});
    setModalType('form');
  };

  const processPayment = async () => {
    if (!selectedPlan || !selectedMethod) return;
    
    setIsProcessing(true);
    
    try {
      // Simile yon peman
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Kreye nouvo tranzaksyon an
      const newPayment: PaymentTransaction = {
        id: Date.now().toString(),
        reference: `PAY-${new Date().getFullYear()}-${String(paymentHistory.length + 1).padStart(3, '0')}`,
        adminId: adminId,
        amount: selectedPlan.price,
        currency: selectedPlan.currency,
        paymentMethod: selectedMethod.id,
        status: 'completed',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        phoneNumber: formData.phoneNumber,
        cardLastFour: formData.cardNumber ? formData.cardNumber.slice(-4) : undefined,
        cardType: formData.cardType
      };
      
      // Ajoute nan istorik la
      setPaymentHistory(prev => [newPayment, ...prev]);
      
      // Afiche modal siksè
      setModalType('success');
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Erè nan peman an. Tanpri eseye ankò.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateForm = (): boolean => {
    if (!selectedMethod) return false;

    switch (selectedMethod.type) {
      case 'mobile_money':
        if (!formData.phoneNumber || !formData.phoneNumber.startsWith('+509')) {
          alert('Veuillez entrer un numéro de téléphone haïtien valide (+509)');
          return false;
        }
        break;
      
      case 'card':
        if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
          alert('Veuillez entrer un numéro de carte valide (16 chiffres)');
          return false;
        }
        if (!formData.cardHolder) {
          alert('Veuillez entrer le nom du titulaire de la carte');
          return false;
        }
        if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
          alert('Veuillez entrer une date d\'expiration valide (MM/AA)');
          return false;
        }
        if (!formData.cvv || formData.cvv.length !== 3) {
          alert('Veuillez entrer un CVV valide (3 chiffres)');
          return false;
        }
        if (!formData.cardType) {
          alert('Veuillez sélectionner le type de carte');
          return false;
        }
        break;
      
      case 'bank_transfer':
        if (!formData.bankName) {
          alert('Veuillez sélectionner votre banque');
          return false;
        }
        if (!formData.accountNumber) {
          alert('Veuillez entrer votre numéro de compte');
          return false;
        }
        break;
      
      case 'paypal':
        if (!formData.paypalEmail || !/\S+@\S+\.\S+/.test(formData.paypalEmail)) {
          alert('Veuillez entrer une adresse email PayPal valide');
          return false;
        }
        break;
    }

    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      processPayment();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'primary';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-HT', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getMethodLogo = (methodId: string) => {
    const method = PAYMENT_METHODS.find(m => m.id === methodId);
    return method?.logo || '💳';
  };

  const getMethodName = (methodId: string) => {
    const method = PAYMENT_METHODS.find(m => m.id === methodId);
    return method?.name || 'Inconnu';
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ').slice(0, 19) : '';
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetPaymentFlow = () => {
    setSelectedPlan(null);
    setSelectedMethod(null);
    setFormData({});
    setModalType(null);
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        
        {/* En-tête ak estatistik */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Paiement des Services
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gérez votre abonnement et les paiements
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setModalType('history')}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-theme-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              Historique des Paiements
            </button>
            
            <button 
              onClick={() => setModalType('plan')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
              </svg>
              Changer de Plan
            </button>
          </div>
        </div>

        {/* Kat estatistik yo */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plan Actuel</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {SUBSCRIPTION_PLANS.find(p => p.id === currentPlan)?.name || 'Basique'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paiements Réussis</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {paymentHistory.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prochain Paiement</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">15 {new Date().toLocaleString('fr-FR', { month: 'long' })}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépense Totale</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatAmount(
                    paymentHistory.filter(p => p.status === 'completed')
                      .reduce((sum, p) => sum + p.amount, 0),
                    'HTG'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan abònman yo */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">
            Plans d'Abonnement Disponibles
          </h4>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg border p-6 transition-all hover:shadow-lg ${
                  plan.isPopular
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                {plan.isPopular && (
                  <div className="mb-4">
                    <Badge color="primary" size="sm">
                      Plus Populaire
                    </Badge>
                  </div>
                )}
                
                <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
                  {plan.name}
                </h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-800 dark:text-white/90">
                    {formatAmount(plan.price, plan.currency)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/mois</span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    plan.isPopular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {currentPlan === plan.id ? 'Plan Actuel' : 'Choisir ce Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Metòd peman yo */}
        <div>
          <h4 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">
            Méthodes de Paiement Acceptées
          </h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition-shadow"
              >
                <div className="mb-2 text-2xl">
                  {method.logo}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  {method.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Frais: {method.fees}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal pou chwazi yon plan */}
      {modalType === 'plan' && (
        <PlanSelectionModal
          plans={SUBSCRIPTION_PLANS}
          currentPlan={currentPlan}
          onPlanSelect={handlePlanSelect}
          onClose={() => setModalType(null)}
        />
      )}

      {/* Modal pou chwazi metod peman an */}
      {modalType === 'payment' && selectedPlan && (
        <PaymentMethodModal
          plan={selectedPlan}
          paymentMethods={PAYMENT_METHODS}
          onMethodSelect={handlePaymentMethodSelect}
          onClose={() => {
            setModalType(null);
            setSelectedPlan(null);
          }}
        />
      )}

      {/* Modal pou fòmilè peman an */}
      {modalType === 'form' && selectedPlan && selectedMethod && (
        <PaymentFormModal
          plan={selectedPlan}
          method={selectedMethod}
          formData={formData}
          onFormChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onClose={() => setModalType('payment')}
          isProcessing={isProcessing}
          formatCardNumber={formatCardNumber}
          formatExpiryDate={formatExpiryDate}
        />
      )}

      {/* Modal siksè peman an */}
      {modalType === 'success' && selectedPlan && selectedMethod && (
        <PaymentSuccessModal
          plan={selectedPlan}
          method={selectedMethod}
          onClose={resetPaymentFlow}
        />
      )}

      {/* Modal pou istorik peman yo */}
      {modalType === 'history' && (
        <PaymentHistoryModal
          payments={paymentHistory}
          onClose={() => setModalType(null)}
          getMethodLogo={getMethodLogo}
          getMethodName={getMethodName}
          getStatusColor={getStatusColor}
          formatAmount={formatAmount}
        />
      )}
    </div>
  );
}

// Komponan pou seleksyon plan
function PlanSelectionModal({ 
  plans, 
  currentPlan, 
  onPlanSelect, 
  onClose 
}: { 
  plans: SubscriptionPlan[];
  currentPlan: string;
  onPlanSelect: (plan: SubscriptionPlan) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Choisir un Plan d'Abonnement
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-lg border p-6 transition-all hover:scale-105 ${
                  plan.isPopular
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                } ${
                  currentPlan === plan.id ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {plan.isPopular && (
                  <div className="mb-4">
                    <Badge color="primary" size="sm">
                      Plus Populaire
                    </Badge>
                  </div>
                )}
                
                {currentPlan === plan.id && (
                  <div className="mb-4">
                    <Badge color="success" size="sm">
                      Plan Actuel
                    </Badge>
                  </div>
                )}
                
                <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
                  {plan.name}
                </h5>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-800 dark:text-white/90">
                    {new Intl.NumberFormat('fr-HT', {
                      style: 'currency',
                      currency: plan.currency
                    }).format(plan.price)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/mois</span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => onPlanSelect(plan)}
                  disabled={currentPlan === plan.id}
                  className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    currentPlan === plan.id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                      : plan.isPopular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {currentPlan === plan.id ? 'Plan Actuel' : 'Sélectionner'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponan pou chwazi metod peman
function PaymentMethodModal({
  plan,
  paymentMethods,
  onMethodSelect,
  onClose
}: {
  plan: SubscriptionPlan;
  paymentMethods: PaymentMethod[];
  onMethodSelect: (method: PaymentMethod) => void;
  onClose: () => void;
}) {
  const totalAmount = plan.price;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Choisir le Mode de Paiement
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {/* Rekapitilasyon */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-2">Récapitulatif</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Prix:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {new Intl.NumberFormat('fr-HT', {
                    style: 'currency',
                    currency: plan.currency
                  }).format(plan.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Metòd peman yo */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">
              Sélectionnez votre méthode de paiement
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => onMethodSelect(method)}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {method.logo}
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {method.name}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {method.description}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {new Intl.NumberFormat('fr-HT', {
                        style: 'currency',
                        currency: plan.currency
                      }).format(totalAmount * (1 + method.fees / 100))}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                      Frais: {method.fees}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponan pou fòmilè peman
function PaymentFormModal({
  plan,
  method,
  formData,
  onFormChange,
  onSubmit,
  onClose,
  isProcessing,
  formatCardNumber,
  formatExpiryDate
}: {
  plan: SubscriptionPlan;
  method: PaymentMethod;
  formData: PaymentFormData;
  onFormChange: (field: keyof PaymentFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isProcessing: boolean;
  formatCardNumber: (value: string) => string;
  formatExpiryDate: (value: string) => string;
}) {
  const totalAmount = plan.price * (1 + method.fees / 100);

  const renderFormFields = () => {
    switch (method.type) {
      case 'mobile_money':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de Téléphone *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber || ''}
                onChange={(e) => onFormChange('phoneNumber', e.target.value)}
                placeholder="+509 48 12 34 56"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
                maxLength={15}
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Vous recevrez une demande de confirmation sur ce numéro
              </p>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de Carte *
              </label>
              <select
                value={formData.cardType || ''}
                onChange={(e) => onFormChange('cardType', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                required
              >
                <option value="">Sélectionnez le type de carte</option>
                {CARD_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de Carte *
              </label>
              <input
                type="text"
                value={formData.cardNumber || ''}
                onChange={(e) => onFormChange('cardNumber', formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
                maxLength={19}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom du Titulaire *
              </label>
              <input
                type="text"
                value={formData.cardHolder || ''}
                onChange={(e) => onFormChange('cardHolder', e.target.value.toUpperCase())}
                placeholder="JEAN DUPONT"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date d'Expiration *
                </label>
                <input
                  type="text"
                  value={formData.expiryDate || ''}
                  onChange={(e) => onFormChange('expiryDate', formatExpiryDate(e.target.value))}
                  placeholder="MM/AA"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
                  maxLength={5}
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
                  onChange={(e) => onFormChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="123"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
                  maxLength={3}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Banque *
              </label>
              <select
                value={formData.bankName || ''}
                onChange={(e) => onFormChange('bankName', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90"
                required
              >
                <option value="">Sélectionnez votre banque</option>
                <option value="Unibank">Unibank</option>
                <option value="BNC">BNC</option>
                <option value="Sogebank">Sogebank</option>
                <option value="Capital Bank">Capital Bank</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de Compte *
              </label>
              <input
                type="text"
                value={formData.accountNumber || ''}
                onChange={(e) => onFormChange('accountNumber', e.target.value)}
                placeholder="Numéro de compte bancaire"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
                required
              />
            </div>
          </div>
        );

      case 'paypal':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email PayPal *
              </label>
              <input
                type="email"
                value={formData.paypalEmail || ''}
                onChange={(e) => onFormChange('paypalEmail', e.target.value)}
                placeholder="votre@email.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white/90 dark:placeholder:text-gray-400"
                required
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Vous serez redirigé vers PayPal pour compléter votre paiement de manière sécurisée.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Paiement - {method.name}
          </h3>
          <button onClick={onClose} disabled={isProcessing} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {/* Rekapitilasyon */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
            <h4 className="font-medium text-gray-800 dark:text-white/90 mb-2">Récapitulatif</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Prix:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {new Intl.NumberFormat('fr-HT', {
                    style: 'currency',
                    currency: plan.currency
                  }).format(plan.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Frais ({method.name}):</span>
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {new Intl.NumberFormat('fr-HT', {
                    style: 'currency',
                    currency: plan.currency
                  }).format(plan.price * (method.fees / 100))}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                <span className="font-medium text-gray-800 dark:text-white/90">Total:</span>
                <span className="font-bold text-gray-800 dark:text-white/90">
                  {new Intl.NumberFormat('fr-HT', {
                    style: 'currency',
                    currency: plan.currency
                  }).format(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit}>
            {renderFormFields()}

            {/* Bouton peman */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Traitement en cours...
                  </>
                ) : (
                  `Payer ${new Intl.NumberFormat('fr-HT', {
                    style: 'currency',
                    currency: plan.currency
                  }).format(totalAmount)}`
                )}
              </button>
            </div>
          </form>

          {/* Enfòmasyon sekirite */}
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            Paiement sécurisé - Vos données sont protégées
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponan pou siksè peman an
function PaymentSuccessModal({
  plan,
  method,
  onClose
}: {
  plan: SubscriptionPlan;
  method: PaymentMethod;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="p-8 text-center">
          {/* Ikon siksè */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>

          {/* Tit siksè */}
          <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white/90">
            Paiement Réussi !
          </h3>

          {/* Mesaj siksè */}
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Votre paiement pour le plan <strong>{plan.name}</strong> a été traité avec succès via {method.name}.
          </p>

          {/* Detay peman an */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Montant:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {new Intl.NumberFormat('fr-HT', {
                    style: 'currency',
                    currency: plan.currency
                  }).format(plan.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Méthode:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">{method.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {new Date().toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Mesaj final */}
          <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              🎉 Félicitations ! Votre abonnement est maintenant actif. Vous recevrez un email de confirmation sous peu.
            </p>
          </div>

          {/* Bouton femen */}
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Retour au Tableau de Bord
          </button>
        </div>
      </div>
    </div>
  );
}

// Komponan pou istorik peman yo
function PaymentHistoryModal({
  payments,
  onClose,
  getMethodLogo,
  getMethodName,
  getStatusColor,
  formatAmount
}: {
  payments: PaymentTransaction[];
  onClose: () => void;
  getMethodLogo: (methodId: string) => string;
  getMethodName: (methodId: string) => string;
  getStatusColor: (status: string) => string;
  formatAmount: (amount: number, currency: string) => string;
}) {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Historique des Paiements
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Référence
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Montant
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Méthode
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Statut
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Date
                </TableCell>
                <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Téléphone
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableCell className="py-3">
                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {payment.reference}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-gray-800 text-theme-sm dark:text-white/90 font-semibold">
                      {formatAmount(payment.amount, payment.currency)}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="text-lg">
                        {getMethodLogo(payment.paymentMethod)}
                      </div>
                      <span className="text-gray-800 text-theme-sm dark:text-white/90">
                        {getMethodName(payment.paymentMethod)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      size="sm"
                      color={getStatusColor(payment.status)}
                    >
                      {payment.status === 'completed' ? 'Complété' :
                       payment.status === 'pending' ? 'En attente' :
                       payment.status === 'failed' ? 'Échoué' : 'Annulé'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-gray-800 text-theme-sm dark:text-white/90">
                      {new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="text-gray-800 text-theme-sm dark:text-white/90">
                      {payment.phoneNumber || '-'}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {payments.length === 0 && (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun paiement trouvé</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Aucun paiement n'a été effectué pour le moment.
              </p>
            </div>
          )}

          {/* Rezime estatistik */}
          {payments.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Paiements</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatAmount(
                    payments.filter(p => p.status === 'completed')
                      .reduce((sum, p) => sum + p.amount, 0),
                    'HTG'
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paiements Réussis</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {payments.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Attente</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}