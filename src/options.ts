import z from 'zod'
import { getInputFileContent } from './logic'

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
export type Options = z.infer<typeof optionsSchema>
export type RawOptions = Partial<Options>

export const vaildateOptions = (rawOptions: RawOptions): Options => {
    const optionsFromInputFile = rawOptions.input
        ? getInputFileContent(rawOptions.input)
        : {}
    return optionsSchema.parse({ ...optionsFromInputFile, ...rawOptions })
}
