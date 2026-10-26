export type ActionResult<T> =
  { success: true; data: T } | { success: false; error: string };

/** Give React Query and form handlers the same throwing contract as fetch. */
export function unwrapAction<T>(result: ActionResult<T>): T {
  if (!result.success) throw new Error(result.error);
  return result.data;
}
