import { z } from 'zod'

export const outputSchema = z.object({
  feedback: z.string(),
  hints: z
    .array(z.string())
    .max(2, 'You can only provide up to 2 hints.')
    .optional()
    .describe('max 2 hints'),
  snippet: z.string().optional().describe('code snippet should be in format.'),
  programmingLanguage: z
    .enum(['cpp', 'jsx', 'jsonp', 'java', 'javascript', 'python', 'sql', 'c'])
    .optional()
    .describe('Programming language code as supports by prismjs'),
})
