export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  timeout?: number;
}