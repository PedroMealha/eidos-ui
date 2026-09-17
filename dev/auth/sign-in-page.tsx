import React, { useState } from 'react';
import { Alert, Button, Card, Input, OTPInput, SegmentedControl, Stepper } from 'eidos-ui';
import { authApi, DEMO_OTP_CODE } from '../api/auth';
import { errorMessage } from '../api/client';
import type { Role } from '../api/types';
import { useAuth } from './auth-context';
import { useRouter } from '../routes/router';

const STEPS = [
  { label: 'Your email', description: 'Where we send the code' },
  { label: 'Verify', description: 'Enter the 6-digit code' },
];

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin', tooltip: 'Full access, including the team editor' },
  { value: 'member', label: 'Member', tooltip: 'Ticket access only - team page is restricted' },
];

export const SignInPage: React.FC = () => {
  const { completeSignIn } = useAuth();
  const { navigate } = useRouter();

  const [step, setStep] = useState<0 | 1>(0);
  const [email, setEmail] = useState('pedro.mealha@meridian.test');
  const [role, setRole] = useState<Role>('admin');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const requestCode = async () => {
    setPending(true);
    setFieldError(null);
    setFormError(null);
    try {
      await authApi.requestCode(email);
      setStep(1);
    } catch (error) {
      setFieldError(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  const verify = async (value: string) => {
    setPending(true);
    setFormError(null);
    try {
      const session = await authApi.verifyCode(email, value, role);
      completeSignIn(session);
      navigate('/app/dashboard');
    } catch (error) {
      setFormError(errorMessage(error));
      setCode('');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mrd-auth">
      <Card className="mrd-auth__card" variant="elevated" padding="lg">
        <div className="mrd-auth__head">
          <h1 className="mrd-auth__title">Sign in to Meridian</h1>
          <p className="mrd-auth__subtitle">We use a one-time code instead of a password.</p>
        </div>

        <Stepper steps={STEPS} activeStep={step} extendEnd />

        {step === 0 ? (
          <form
            className="mrd-auth__form"
            onSubmit={(event) => {
              event.preventDefault();
              void requestCode();
            }}
          >
            <Input
              type="email"
              label="Work email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              preIcon="mail"
              placeholder="you@company.com"
              error={fieldError ?? undefined}
              fullWidth
              autoFocus
              required
            />

            <div className="mrd-auth__role">
              <span className="mrd-auth__role-label">Sign in as</span>
              <SegmentedControl
                options={ROLE_OPTIONS}
                value={role}
                onChange={(value) => setRole(value as Role)}
                fullWidth
              />
              <span className="mrd-auth__hint">
                Role is normally decided by the server. It is a picker here so you can see how the
                app changes for a non-admin.
              </span>
            </div>

            <Button
              type="submit"
              loading={pending}
              loadingText="Sending code"
              posIcon="arrow-right"
              className="mrd-block"
            >
              Send code
            </Button>
          </form>
        ) : (
          <div className="mrd-auth__form">
            <Alert variant="info" title="Demo code">
              Any address works. Use <strong>{DEMO_OTP_CODE}</strong> as the code.
            </Alert>

            <OTPInput
              label={`Code sent to ${email}`}
              value={code}
              onChange={setCode}
              onComplete={(value) => void verify(value)}
              disabled={pending}
              error={formError ?? undefined}
              autoFocus
            />

            <Button
              onClick={() => void verify(code)}
              loading={pending}
              loadingText="Verifying"
              disabled={code.length < 6}
              className="mrd-block"
            >
              Verify and continue
            </Button>

            <Button
              variant="text"
              color="secondary"
              preIcon="arrow-left"
              disabled={pending}
              onClick={() => {
                setStep(0);
                setCode('');
                setFormError(null);
              }}
              className="mrd-block"
            >
              Use a different email
            </Button>
          </div>
        )}
      </Card>

      <p className="mrd-auth__legal">
        Demo only - authentication is simulated in the browser. No credentials are sent anywhere.
      </p>
    </div>
  );
};
