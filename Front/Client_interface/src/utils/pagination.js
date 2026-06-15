/**
 * Normalize paginated API responses while supporting legacy array responses.
 */
export function extractPaginated(responseData, fallback = []) {
  if (!responseData) return { data: fallback, meta: null };

  if (Array.isArray(responseData)) {
    return { data: responseData, meta: null };
  }

  if (Array.isArray(responseData.data)) {
    return {
      data: responseData.data,
      meta: responseData.meta ?? null,
    };
  }

  return { data: fallback, meta: null };
}

export default extractPaginated;
