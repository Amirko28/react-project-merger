#!/usr/bin/env node
import { Command } from 'commander'
import { z } from 'zod'
import {
    getInputFileContent,
    mergeProjects,
    printFinishedMessage,
} from './logic'
import packageJson from '../package.json'

const requiredOptionsSchema = z.object({
    paths: z.array(z.string()).min(2),
    output: z.string(),
})

export type RequiredOptionsSchema = z.infer<typeof requiredOptionsSchema>

const optionalOptionsSchema = z.object({
    input: z.string().optional(),
    debug: z.boolean(),
    force: z.boolean(),
    javascript: z.boolean(),
    mainFileName: z.string(),
})

const optionsSchema = requiredOptionsSchema.merge(optionalOptionsSchema)

export type OptionsSchema = z.infer<typeof optionsSchema>

type RawOptions = Partial<OptionsSchema>

const vaildateOptions = (rawOptions: RawOptions): OptionsSchema => {
    const optionsFromInputFile = rawOptions.input
        ? getInputFileContent(rawOptions.input, optionsSchema)
        : {}
    const optionsFromCLI = optionsSchema.parse(rawOptions)
    const options = { ...optionsFromInputFile, ...optionsFromCLI }
    return options
}

const program = new Command()

program
    .option('-p, --paths <paths...>', `projects' paths`)
    .option('-o, --output <output>', `output path`)
    .option('-d, --debug', 'debug mode', false)
    .option('-f, --force', 'force directory overwrite', false)
    .option('-js, --javascript', 'generate a javascript project', false)
    .option('--main-file-name <mainFileName>', 'index file name', 'src/App')
    .option('-i, --input <input>', 'input file name')
    .action(async (rawOptions: RawOptions) => {
        try {
            const options = vaildateOptions(rawOptions)
            if (options.debug) {
                console.log(options)
            }
            await mergeProjects(options)
            printFinishedMessage(options.output)
        } catch (error) {
            console.error(error)
        }
    })
    .description('Merge projects')
    .version(packageJson.version)

program.parse(process.argv)
