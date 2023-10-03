#!/usr/bin/env node
import { Command } from 'commander'
import {
    getInputFileContent,
    mergeProjects,
    printFinishedMessage,
} from './logic'
import packageJson from '../package.json'
import { OptionsSchema, RawOptions, optionsSchema } from './options'

const vaildateOptions = (rawOptions: RawOptions): OptionsSchema => {
    const optionsFromInputFile = rawOptions.input
        ? getInputFileContent(rawOptions.input)
        : {}
    return optionsSchema.parse({ ...optionsFromInputFile, ...rawOptions })
}

const program = new Command()

program
    .description('Merge projects')
    .usage('merge <paths...> <output> [options]')
    .version(packageJson.version)
    .option('-p, --paths <paths...>', `projects' paths`)
    .option('-o, --output <output>', `output path`)
    .option('-i, --input <input>', 'input file name')
    .option('-f, --force', 'force directory overwrite (default: false)')
    .option(
        '-js, --javascript',
        'generate a javascript project (default: false)'
    )
    .option(
        '--app-file <appFilePath>',
        `app component path (default: 'src/App')`
    )
    .option('-d, --debug', 'debug mode (default: false)')
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

program.parse(process.argv)
