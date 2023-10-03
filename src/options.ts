import z from 'zod'

const requiredOptionsSchema = z.object({
    paths: z.array(z.string()).min(2),
    output: z.string(),
})

const optionalOptionsSchema = z.object({
    input: z.string().optional(),
    debug: z.boolean().default(false),
    force: z.boolean().default(false),
    javascript: z.boolean().default(false),
    appFilePath: z.string().default('src/App'),
})

export const optionsSchema = requiredOptionsSchema.merge(optionalOptionsSchema)
export type OptionsSchema = z.infer<typeof optionsSchema>
export type RawOptions = Partial<OptionsSchema>
