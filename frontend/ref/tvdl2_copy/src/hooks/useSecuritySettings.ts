import { useState, useEffect } from 'react';
import { SecuritySettings, UpdateSecuritySettingsRequest } from '@/types/security';

export function useSecuritySettings(token: string) {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/security', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch security settings');
      }

      const data = await response.json();
      setSettings(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: UpdateSecuritySettingsRequest) => {
    try {
      setError(null);
      
      const response = await fetch('/api/admin/security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update security settings');
      }

      const data = await response.json();
      setSettings(data.data);
      return { success: true, data: data.data, warnings: data.warnings };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update security settings';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetSettings = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset security settings');
      }

      const data = await response.json();
      setSettings(data.data);
      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset security settings';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    refetch: fetchSettings
  };
}

export function usePasswordValidation() {
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validating, setValidating] = useState(false);

  const validatePassword = async (password: string) => {
    try {
      setValidating(true);
      
      const response = await fetch('/api/admin/security/validate-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        throw new Error('Failed to validate password');
      }

      const data = await response.json();
      setValidationResult(data.data);
      return data.data;
    } catch (err) {
      console.error('Password validation error:', err);
      return null;
    } finally {
      setValidating(false);
    }
  };

  const clearValidation = () => {
    setValidationResult(null);
  };

  return {
    validationResult,
    validating,
    validatePassword,
    clearValidation
  };
}