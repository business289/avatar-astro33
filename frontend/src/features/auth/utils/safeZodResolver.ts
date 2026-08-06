import type {
  FieldErrors,
  FieldValues,
  Resolver,
  ResolverResult,
} from "react-hook-form";
import type { ZodTypeAny } from "zod";

/**
 * Custom Zod resolver that uses safeParse directly.
 * Avoids @hookform/resolvers' Standard Schema path, which breaks with Zod 3.25.
 */
export function safeZodResolver<T extends FieldValues>(
  schema: ZodTypeAny,
): Resolver<T> {
  return async (values): Promise<ResolverResult<T>> => {
    const result = schema.safeParse(values);

    if (result.success) {
      return {
        values: result.data as T,
        errors: {},
      };
    }

    const errors = {} as FieldErrors<T>;

    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "root");
      if (!(key in errors)) {
        Object.assign(errors, {
          [key]: {
            type: issue.code,
            message: issue.message,
          },
        });
      }
    }

    return {
      values: {} as T,
      errors,
    };
  };
}
