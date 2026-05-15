/// <reference types="react-scripts" />

declare module 'jest-axe' {
  import type { AxeResults } from 'axe-core';

  export function axe(element: Element, ...args: unknown[]): Promise<AxeResults>;
  export const toHaveNoViolations: unknown;
}
