/**
 * Resultado na liberação de um lock.
 */
import { LockState } from './LockState';

export interface LockResult<TCallbackResult = unknown> {
  /**
   * Estado do lock.
   */
  lockState: LockState;

  /**
   * Sinaliza que a função de callback não resultou em erro.
   */
  callbackSuccess?: boolean;

  /**
   * Retorno da função de callback.
   */
  callbackResult?: TCallbackResult | undefined;

  /**
   * Erro lançado pela função de callback.
   */
  callbackError?: unknown;
}
