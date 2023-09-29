import { rmSync } from 'fs'
import {
    copyDirectory,
    generateIndexFile,
    getGitIgnoredFileNames,
} from './util/fs'
import { OptionsSchema } from '.'
import { handleAllSettled } from './util/error'

const copySourceDirectories = async (options: OptionsSchema) => {
    console.log('Copying source directories...')
    await handleAllSettled(
        options.paths.map((path) => {
            const ignoredFiles = getGitIgnoredFileNames(path)
            return copyDirectory({
                sourceDir: path,
                targetDir: `${options.output}/${path}`,
                ignoredFiles,
            })
        })
    )
}

export const mergeProjects = async (options: OptionsSchema) => {
    if (options.force) {
        rmSync(options.output, { recursive: true, force: true })
    }

    await copySourceDirectories(options)
    await copyRootFiles(options.paths[0] as string, options.output)
    generateIndexFile(options.paths, options.output, options.javascript)
}
const copyRootFiles = async (sourcePath: string, outputPath: string) => {
    console.log(`Copying root files from ${sourcePath}...`)
    const ignoredFiles = getGitIgnoredFileNames(sourcePath)
    await copyDirectory({
        sourceDir: sourcePath,
        targetDir: outputPath,
        ignoredFiles,
        recursive: false,
    })
}
