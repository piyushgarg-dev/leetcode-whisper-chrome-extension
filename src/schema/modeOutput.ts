import { z } from 'zod'

const SupportedLanguages = [
  'c',
  'cpp',
  'csharp',
  'cs',
  'dart',
  'elixir',
  'erlang',
  'go',
  'java',
  'javascript',
  'jsonp',
  'jsx',
  'php',
  'python',
  'racket',
  'rkt',
  'ruby',
  'rb',
  'rust',
  'scala',
  'sql',
  'Swift',
  'typescript',
  'tsx',
] as const

export const outputSchema = z.object({
  feedback: z.string(),
  hints: z
    .array(z.string())
    .max(2, 'You can only provide up to 2 hints.')
    .optional()
    .describe('max 2 hints'),
  snippet: z.string().optional().describe('code snippet should be in format.'),
  programmingLanguage: z
    .enum(SupportedLanguages)
    .optional()
    .describe('Programming language code as supports by prismjs'),
})
