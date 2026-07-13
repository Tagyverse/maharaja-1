import { useState, useEffect, useCallback } from 'react';
import {
  getRebrandConfig,
  getPaymentConfig,
  getWhatsAppConfig,
  getTelegramConfig,
  RebrandConfig,
  PaymentConfig,
  WhatsAppConfig,
  TelegramConfig,
} from '../utils/clientCopyFirebase';

interface ClientConfigState {
  rebrand: RebrandConfig | null;
  payment: PaymentConfig | null;
  whatsapp: WhatsAppConfig | null;
  telegram: TelegramConfig | null;
  loading: boolean;
  error: string | null;
}

export function useClientConfig(clientId: string) {
  const [state, setState] = useState<ClientConfigState>({
    rebrand: null,
    payment: null,
    whatsapp: null,
    telegram: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [rebrand, payment, whatsapp, telegram] = await Promise.all([
          getRebrandConfig(clientId),
          getPaymentConfig(clientId),
          getWhatsAppConfig(clientId),
          getTelegramConfig(clientId),
        ]);

        setState({
          rebrand,
          payment,
          whatsapp,
          telegram,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load config',
        }));
      }
    };

    if (clientId) {
      loadConfigs();
    }
  }, [clientId]);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const [rebrand, payment, whatsapp, telegram] = await Promise.all([
        getRebrandConfig(clientId),
        getPaymentConfig(clientId),
        getWhatsAppConfig(clientId),
        getTelegramConfig(clientId),
      ]);

      setState({
        rebrand,
        payment,
        whatsapp,
        telegram,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh config',
      }));
    }
  }, [clientId]);

  return { ...state, refresh };
}
