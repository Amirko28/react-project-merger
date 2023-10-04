#!/usr/bin/env node
import { Command } from 'commander'
import {
    getFinishedMessage,
    copySourceProjects,
    generateMergedProjectSrcCode,
} from './logic'
import { Options, RawOptions, vaildateOptions } from './options'
import { getUserPkgManager } from './util/getUserPkgManager'
import packageJson from '../package.json'

const mergeProjects = async (options: Options) => {
    await copySourceProjects(options)
    generateMergedProjectSrcCode(options)
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
    .option('--javascript', 'generate a javascript project (default: false)')
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
            console.log(getFinishedMessage(options.output, getUserPkgManager()))
        } catch (error) {
            console.error(error)
        }
    })

program.parse(process.argv)
