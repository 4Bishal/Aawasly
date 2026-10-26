import "server-only";
import { publicError } from "@/lib/http";
import type { ActionResult } from "@/lib/action-result";

export async function executeAction<T>(
  work: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await work() };
  } catch (error) {
    return { success: false, error: publicError(error).body.error };
  }
}
