import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { djangoAuthApi } from '../../api/djangoAuthApi';
import Button from '../../components/ui/button/Button';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const { token: pathToken } = useParams<{ token: string }>();
  
  // Support des deux formats : query params (legacy) ou path param (nouveau)
  const uidb64 = searchParams.get('uidb64');
  const queryToken = searchParams.get('token');
  const token = pathToken || queryToken;

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifierEmail = async () => {
      // 1. Essayer le nouveau format (Path Token ou Query Token seul)
      if (token && !uidb64) {
        try {
          const result = await djangoAuthApi.confirmEmailVerification(token);
          if (result.success) {
            setStatus('success');
            setMessage('Votre compte a bien été créé mais il n\'est pas encore actif. Les administrateurs l\'activeront après vérification.');
          } else {
            setStatus('error');
            setMessage(result.message || 'Le lien est invalide ou a expiré.');
          }
        } catch (error) {
          setStatus('error');
          setMessage('Impossible de contacter le serveur de sécurité.');
        }
        return;
      }

      // 2. Fallback sur l'ancien format (UIDB64 + Token)
      if (uidb64 && queryToken) {
        try {
          const result = await djangoAuthApi.verifyEmailLink(uidb64, queryToken);
          if (result.success) {
            setStatus('success');
            setMessage('Votre compte a bien été créé mais il n\'est pas encore actif. Les administrateurs l\'activeront après vérification.');
          } else {
            setStatus('error');
            setMessage(result.message || 'Le lien est invalide.');
          }
        } catch (error) {
          setStatus('error');
          setMessage('Erreur serveur.');
        }
        return;
      }

      // Si rien n'est fourni
      setStatus('error');
      setMessage('Lien de vérification invalide ou incomplet.');
    };

    verifierEmail();
  }, [uidb64, queryToken, token]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden font-outfit">
      {/* Decorative background elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/10 dark:bg-brand-900/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden relative group">
          <div className="flex flex-col items-center text-center">
            {/* Status Icon */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-8 border-2 transition-all duration-500 ${
              status === 'loading' ? 'bg-white/5 border-white/20' : 
              status === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 
              'bg-red-500/10 border-red-500/30 text-red-500'
            }`}>
              {status === 'loading' ? (
                <Loader2 className="w-10 h-10 animate-spin text-white/50" />
              ) : status === 'success' ? (
                <ShieldCheck className="w-10 h-10" />
              ) : (
                <ShieldAlert className="w-10 h-10" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
              {status === 'loading' ? 'Vérification...' : 
               status === 'success' ? 'Email Vérifié !' : 
               'Échec Vérification'}
            </h1>
            
            <p className="text-brand-100/70 text-lg mb-8 font-medium leading-relaxed">
              {status === 'loading' ? 'Nous sécurisons votre accès. Veuillez patienter.' : message}
            </p>

            <div className="w-full space-y-4">
              {status === 'success' ? (
                <Link to="/signin" className="w-full block">
                  <Button className="w-full py-4 text-base font-bold shadow-xl shadow-green-500/10 flex items-center justify-center gap-2 group/btn">
                    Se connecter à TRIMED
                    <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>
              ) : status === 'error' ? (
                <Link to="/signup" className="w-full block">
                  <Button className="w-full py-4 text-base font-bold shadow-xl shadow-red-500/10 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700">
                    Réessayer l'inscription
                  </Button>
                </Link>
              ) : (
                <div className="h-14 flex items-center justify-center">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
