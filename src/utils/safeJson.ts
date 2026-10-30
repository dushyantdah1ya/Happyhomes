/**
 * Safe JSON serializer for embedding JSON-LD and initial state scripts into HTML.
 * Prevents XSS / script-injection via </script>, hostile HTML entities,
 * and JavaScript line terminator anomalies (\u2028, \u2029).
 */
export function safeJsonSerialize(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
