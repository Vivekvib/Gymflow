/**
 * Common return shape for Server Actions that report success/failure back
 * to a client form instead of throwing (throwing loses the error message
 * across the server/client boundary in a plain `<form action={...}>`).
 */
export interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export function actionError(error: string): ActionResult<never> {
  return { success: false, error };
}

export function actionSuccess<T>(data?: T): ActionResult<T> {
  return { success: true, data };
}
