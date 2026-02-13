import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle } from 'lucide-react';
import logoMcd from '@/assets/logo-mcd.png';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const CustomerAuth = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const redirectTo = new URLSearchParams(window.location.search).get('redirect') || `/${lang}`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? t('auth.invalidCredentials', { defaultValue: 'Email ou mot de passe incorrect' })
        : error.message);
    } else {
      navigate(redirectTo);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError(t('auth.passwordTooShort', { defaultValue: 'Le mot de passe doit contenir au moins 6 caractères' }));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + `/${lang}/account`,
        data: { full_name: fullName, phone },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSignupSuccess(true);
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="w-full max-w-md text-center">
          <img src={logoMcd} alt="MCD AUTO" className="h-16 w-auto mx-auto mb-6" />
          <div className="bg-card rounded-lg border p-6">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <h2 className="text-xl font-heading font-bold mb-2">{t('auth.signupSuccessTitle', { defaultValue: 'Inscription réussie !' })}</h2>
            <p className="text-muted-foreground text-sm">{t('auth.signupSuccessMessage', { defaultValue: 'Vérifiez votre boîte email pour confirmer votre compte avant de vous connecter.' })}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to={`/${lang}`}>
            <img src={logoMcd} alt="MCD AUTO" className="h-16 w-auto mx-auto mb-2" />
          </Link>
          <p className="text-muted-foreground text-sm">
            {mode === 'login' ? t('auth.login') : t('auth.signup')}
          </p>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="bg-card rounded-lg border p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('contact.name')} *</label>
                <Input required value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('contact.phone')}</label>
                <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium mb-1 block">{t('auth.email')}</label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('auth.password')}</label>
            <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={6} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common.loading') : mode === 'login' ? t('auth.loginButton') : t('auth.signupButton')}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <p>
                {t('auth.noAccount')}{' '}
                <button type="button" onClick={() => { setMode('signup'); setError(''); }} className="text-primary hover:underline font-medium">
                  {t('auth.signup')}
                </button>
              </p>
            ) : (
              <p>
                {t('auth.hasAccount')}{' '}
                <button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-primary hover:underline font-medium">
                  {t('auth.login')}
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerAuth;
