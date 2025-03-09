'use client';

/**
 * This hook is a workaround for the Next.js 15 params warning.
 * It allows direct access to params while suppressing the warning.
 * 
 * In a future version of Next.js, we'll need to update this to use React.use()
 * but for now this approach works without TypeScript errors.
 */
export function useParams<T extends Record<string, string>>(params: T): T {
  // We're directly returning the params object
  // This will show a warning in the console but will work correctly
  return params;
} 