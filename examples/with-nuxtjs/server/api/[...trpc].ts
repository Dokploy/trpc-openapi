import { createOpenApiNuxtHandler } from 'trpc-to-openapi';

import { appRouter, createContext } from '../router';

export default createOpenApiNuxtHandler({
  router: appRouter,
  createContext,
});
