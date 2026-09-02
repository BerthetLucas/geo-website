import { defineMiddleware } from 'astro:middleware';
import { paraglideMiddleware } from './paraglide/server.js';

export const onRequest = defineMiddleware((context, next) =>
  paraglideMiddleware(context.request, ({ locale }) => {
    context.locals.locale = locale;
    return next();
  }),
);
