import { TRPCProcedureType } from '@trpc/server';
import { ZodObject, z } from 'zod';

import { OpenApiMeta, OpenApiMethod, OpenApiProcedure, OpenApiProcedureRecord } from '../types';

const mergeInputs = (inputParsers: ZodObject[]): ZodObject => {
  return inputParsers.reduce((acc, inputParser) => {
    return acc.merge(inputParser);
  }, z.object({}));
};

export const getMethod = (procedure: OpenApiProcedure): OpenApiMethod => {
  return getProcedureType(procedure) === 'query' ? 'GET' : 'POST';
};

// `inputParser` & `outputParser` are private so this is a hack to access it
export const getInputOutputParsers = (
  procedure: OpenApiProcedure,
): {
  inputParser: ZodObject;
  outputParser: ZodObject | undefined;
  hasInputsDefined: boolean;
} => {
  const inputs = procedure._def.inputs as ZodObject[];
  // @ts-expect-error The types seems to be incorrect
  const output = procedure._def.output as ZodObject | undefined;

  let inputParser: ZodObject;
  if (inputs.length >= 2) {
    inputParser = mergeInputs(inputs);
  } else if (inputs.length === 1) {
    inputParser = inputs[0]!;
  } else {
    inputParser = z.object({});
  }

  return {
    inputParser,
    outputParser: output,
    hasInputsDefined: inputs.length > 0,
  };
};

const getProcedureType = (procedure: OpenApiProcedure): TRPCProcedureType => {
  if (!procedure._def.type) {
    throw new Error('Unknown procedure type');
  }
  return procedure._def.type;
};

export const forEachOpenApiProcedure = <TMeta = Record<string, unknown>>(
  procedureRecord: OpenApiProcedureRecord,
  callback: (values: {
    path: string;
    type: TRPCProcedureType;
    procedure: OpenApiProcedure;
    meta: {
      openapi: NonNullable<OpenApiMeta['openapi']>;
    } & TMeta;
  }) => void,
) => {
  for (const [path, procedure] of Object.entries(procedureRecord)) {
    const type = getProcedureType(procedure as OpenApiProcedure);
    const meta = procedure._def.meta as unknown as OpenApiMeta | undefined;
    if (meta?.openapi?.enabled === false) {
      continue;
    }
    const additional = meta?.openapi?.additional ?? false;
    const override = meta?.openapi?.override ?? false;

    const defaultOpenApiMeta: NonNullable<OpenApiMeta['openapi']> = {
      method: getMethod(procedure as OpenApiProcedure),
      path: `/${path}`,
      enabled: true,
      tags: [path.split('.')[0] ?? 'default'],
      protect: true,
    };

    let openapi: NonNullable<OpenApiMeta['openapi']>;

    if (override && meta?.openapi) {
      openapi = { ...meta.openapi };
    } else if (additional && meta?.openapi) {
      openapi = { ...defaultOpenApiMeta, ...meta.openapi };
    } else if (meta?.openapi) {
      openapi = { ...meta.openapi, ...defaultOpenApiMeta };
    } else {
      openapi = defaultOpenApiMeta;
    }

    if (openapi.enabled !== false) {
      callback({
        path,
        type,
        procedure: procedure as OpenApiProcedure,
        meta: {
          openapi,
          ...(meta as TMeta),
        },
      });
    }
  }
};
