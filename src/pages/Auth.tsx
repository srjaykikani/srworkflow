
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/5 p-4 md:p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'login'
              ? 'Sign in to access your time tracking dashboard'
              : 'Sign up to start tracking your time and earnings'}
          </p>
        </div>

        <div className="bg-card dark:bg-card rounded-xl shadow-lg p-6 space-y-6">
          <AuthForm mode={mode} />
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-primary"
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Log in'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
