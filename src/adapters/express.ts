import type { Request, Response } from 'express';
import type { NodeHTTPRequest } from '@trpc/server/dist/adapters/node-http';

import type { OpenApiRouter } from '../types';
import {
  type CreateOpenApiNodeHttpHandlerOptions,
  createOpenApiNodeHttpHandler,
} from './node-http/core';

/** Express Request is compatible with NodeHTTPRequest at runtime (query + body). */
export type CreateOpenApiExpressMiddlewareOptions<TRouter extends OpenApiRouter> =
  CreateOpenApiNodeHttpHandlerOptions<TRouter, NodeHTTPRequest, Response>;

export const createOpenApiExpressMiddleware = <TRouter extends OpenApiRouter>(
  opts: CreateOpenApiExpressMiddlewareOptions<TRouter>,
) => {
  const openApiHttpHandler = createOpenApiNodeHttpHandler(opts);

  return async (req: Request, res: Response) => {
    await openApiHttpHandler(req as NodeHTTPRequest, res);
  };
};
