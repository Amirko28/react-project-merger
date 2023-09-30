#!/usr/bin/env node
import { Command } from 'commander'
import { z } from 'zod'
import { mergeProjects } from './logic'
import packageJson from '../package.json'

const optionsSchema = z.object({
    paths: z.array(z.string()).min(2),
    output: z.string(),
    debug: z.boolean(),
    force: z.boolean(),
    javascript: z.boolean(),
    mainFileName: z.string(),
})

export type OptionsSchema = z.infer<typeof optionsSchema>

type RawOptions = Partial<OptionsSchema>

const isOptionsValid = (options: RawOptions): options is OptionsSchema => {
    return optionsSchema.parse(options).paths.length >= 2
}

const program = new Command()

program
    .requiredOption('-p, --paths <paths...>', `projects' paths`)
    .requiredOption('-o, --output <output>', `output path`)
    .option('-d, --debug', `debug mode`, false)
    .option('-f, --force', `force directory overwrite`, false)
    .option('-js, --javascript', 'generate a javascript project', false)
    .option('--main-file-name <mainFileName>', `index file name`, 'src/index')
    .action(async (options: RawOptions) => {
        try {
            if (options.debug) console.log(options)
            if (isOptionsValid(options)) {
                await mergeProjects(options)
            }
        } catch (error) {
            console.error(error)
        }
    })
    .description('Merge projects')
    .version(packageJson.version)

program.parse(process.argv)
