/// <reference path="../.astro/types.d.ts" />

import type { Locale } from './paraglide/runtime.js';

declare global {
  namespace App {
    interface Locals {
      locale: Locale;
    }
  }
}

export {};
