#!/usr/bin/env node
import { Command } from 'commander'
import { z } from 'zod'
import { mergeProjects } from './logic'

const optionsSchema = z.object({
    paths: z.array(z.string()).min(2),
    output: z.string().min(1),
})

export type OptionsSchema = z.infer<typeof optionsSchema>

type RawOptions = {
    paths?: string[]
    output?: string
}

const isOptionsValid = (options: RawOptions): options is OptionsSchema => {
    return (optionsSchema.parse(options) as OptionsSchema).paths.length >= 2
}

const program = new Command()

program
    .option('-p, --paths <paths...>', `projects' paths`)
    .option('-o, --output <output>', `output path`)
    .action((options: RawOptions) => {
        console.log(options)
        try {
            if (isOptionsValid(options)) {
                mergeProjects(options)
            }
        } catch (error) {
            console.error(error)
        }
    })
    .description('Merge projects')

program.parse(process.argv)
