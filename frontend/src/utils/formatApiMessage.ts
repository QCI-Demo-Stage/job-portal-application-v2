import type { ApiErrorBody } from '../types/api';

export function formatApiMessage(message: ApiErrorBody['message'], fallback: string): string {
  if (Array.isArray(message)) {
    return message.join(', ');
  }
  if (typeof message === 'string' && message.length > 0) {
    return message;
  }
  return fallback;
}
