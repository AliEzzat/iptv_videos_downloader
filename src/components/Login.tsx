import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { type IPTVCredentials } from '../types';
import { Eye, EyeOff, Server, User, Lock, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login, isLoading, error, clearError } = useAppStore();
  const [formData, setFormData] = useState<IPTVCredentials>({
    url: '',
    port: 80,
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Partial<IPTVCredentials>>({});

  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateForm = (): boolean => {
    const errors: Partial<IPTVCredentials> = {};

    if (!formData.url.trim()) {
      errors.url = 'Server URL is required';
    } else if (!/^[a-zA-Z0-9.-]+$/.test(formData.url)) {
      errors.url = 'Invalid server URL format';
    }

    if (!formData.port || formData.port < 1 || formData.port > 65535) {
      errors.port = 'Port must be between 1 and 65535';
    }

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleInputChange = (field: keyof IPTVCredentials, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Server className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">IPTV Player</h1>
          <p className="text-dark-400">Enter your IPTV server credentials to continue</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                Server URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className={`input-field ${validationErrors.url ? 'border-red-500' : ''}`}
                  placeholder="example.com or 192.168.1.100"
                  disabled={isLoading}
                />
              </div>
              {validationErrors.url && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.url}</p>
              )}
            </div>

            <div>
              <label htmlFor="port" className="block text-sm font-medium text-gray-300 mb-2">
                Port
              </label>
              <input
                type="number"
                id="port"
                value={formData.port}
                onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 80)}
                className={`input-field ${validationErrors.port ? 'border-red-500' : ''}`}
                placeholder="80"
                min="1"
                max="65535"
                disabled={isLoading}
              />
              {validationErrors.port && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.port}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`input-field pl-10 ${validationErrors.username ? 'border-red-500' : ''}`}
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
              {validationErrors.username && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`input-field pl-10 pr-10 ${validationErrors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Connect to IPTV Server</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-dark-400">
              Need help? Check your IPTV provider's documentation for the correct server details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
