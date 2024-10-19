'use client';
import { useCallback, useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion, useAnimationControls } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

import SocialLogin from './components/SocialLogin';
import Divider from './components/Divider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { emailValidation, nameValidation, passwordValidation } from './validation/validation';
import Loading from '@/components/ui/Loading';
import { useAuth } from './hooks/useAuth';
import FadeIn from '@/components/animation/FadeIn';

enum VARIANTS {
  login = 'LOGIN',
  register = 'REGISTER',
  reset = 'RESET PASSWORD',
}

interface IShowMessage {
  type: 'error' | 'success';
  message: string;
}

type Variant = VARIANTS.login | VARIANTS.register | VARIANTS.reset;

const Auth = () => {
  const [variant, setVariant] = useState<Variant>(VARIANTS.login);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showMessage, setShowMessage] = useState<IShowMessage | null>(null);
  const [bottomMessage, setBottomMessage] = useState<IShowMessage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const controls = useAnimationControls();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    loading,
    register: registerUser,
    signin,
    passwordReset,
    activateUser,
  } = useAuth(setErrors);

  const slideOut = async () => {
    await controls.start({ x: 500, opacity: 0, transition: { duration: 0.5 } });
    slideIn();
  };

  const slideIn = async () => {
    await controls.start({ x: 0, opacity: 1, transition: { duration: 0.5 } });
  };

  const isLogin = variant === VARIANTS.login;
  const isRegister = variant === VARIANTS.register;
  const isReset = variant === VARIANTS.reset;

  const changeVariant = (variant: Variant) => {
    setErrors({});
    setShowMessage(null);
    slideOut();
    setVariant(variant);
  };

  const confirmEmail = async (token: string) => {
    try {
      const data = await activateUser(token);
      setBottomMessage({ type: 'success', message: data.message });
      setFormData({ ...formData, email: data.email });
    } catch (error: any) {
      setBottomMessage({ type: 'error', message: error?.message || 'Error' });
    }
  };

  useEffect(() => {
    if (token) {
      confirmEmail(token);
    }
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBottomMessage(null);

    const currentErrors: { [key: string]: string } = {};
    if (isRegister && !nameValidation(formData.name)) {
      currentErrors.name = 'Invalid name';
    }
    if (!emailValidation(formData.email)) {
      currentErrors.email = 'Invalid email';
    }
    if (isRegister && !passwordValidation(formData.password)) {
      currentErrors.password = 'Invalid password';
    }
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length === 0) {
      try {
        if (isRegister) {
          const message = await registerUser(formData);
          setShowMessage({ type: 'success', message });
        } else if (isLogin) {
          await signin(formData);
        } else if (isReset) {
          const message = await passwordReset(formData);
          setShowMessage({ type: 'success', message });
        }
      } catch (error: any) {
        setShowMessage({ type: 'error', message: error?.message || 'Error' });
      }
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 1, x: 0 }} animate={controls}>
        <FadeIn delay={0.2} direction="left">
          <SocialLogin />
        </FadeIn>
        <FadeIn delay={0.4} direction="left">
          <Divider />
        </FadeIn>

        <form action="" onSubmit={onSubmit} className="py-6">
          <FadeIn delay={0.8} direction="left">
            {isRegister && (
              <Input
                label="Name"
                value={formData.name}
                id="name"
                type="text"
                onChange={handleInputChange}
                errors={errors}
                className="mb-6"
              />
            )}

            <Input
              label="Email"
              value={formData.email}
              id="email"
              type="email"
              className={`${showMessage ? '' : 'mb-6'}`}
              onChange={handleInputChange}
              errors={errors}
            />

            {showMessage && (
              <div
                className={`mb-6 mt-1 text-xs leading-3 ${
                  showMessage.type === 'error' ? 'text-rose-500' : 'text-lime-600'
                }`}
              >
                {showMessage?.message}
              </div>
            )}

            {!isReset && (
              <div className="relative flex flex-col items-end">
                <Input
                  label="Password"
                  value={formData.password}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  onChange={handleInputChange}
                  errors={errors}
                />

                <div>
                  {!showPassword ? (
                    <FaEye
                      className="absolute right-2 top-5 cursor-pointer"
                      onClick={() => setShowPassword(true)}
                    />
                  ) : (
                    <FaEyeSlash
                      className="absolute right-2 top-5 cursor-pointer"
                      onClick={() => setShowPassword(false)}
                    />
                  )}
                </div>

                {isRegister && (
                  <p className="ml-2 mt-2 text-xs text-gray-500">
                    Your password must be at least 8 characters long and include a mix of upper and
                    lower case letters, numbers, and special characters.
                  </p>
                )}

                <span
                  className="-mr-3 w-max cursor-pointer p-3"
                  onClick={() => changeVariant(VARIANTS.reset)}
                >
                  <span className="text-sm tracking-wide text-blue-600">Forgot password ?</span>
                </span>
              </div>
            )}
          </FadeIn>

          <FadeIn delay={0.8} direction="left">
            <Button
              type="submit"
              variant="ai"
              size="full"
              disabled={loading || showMessage?.type === 'success'}
            >
              {loading && <Loading className="mr-2" />}
              {(isLogin && VARIANTS.login) ||
                (isRegister && VARIANTS.register) ||
                (isReset && VARIANTS.reset)}
            </Button>
            <div className="-ml-3 w-max p-3">
              <span
                onClick={() => changeVariant(isLogin ? VARIANTS.register : VARIANTS.login)}
                className="cursor-pointer text-sm tracking-wide text-blue-600"
              >
                {isLogin ? 'Create new account' : 'Login to your account'}
              </span>
            </div>
          </FadeIn>
          {bottomMessage && (
            <div
              className={`text-sm leading-3 ${
                bottomMessage?.type === 'error' ? 'text-rose-500' : 'text-lime-600'
              }`}
            >
              {bottomMessage.message}
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default Auth;
