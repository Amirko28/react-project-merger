import { Options } from '../options'
import { handleAllSettled } from '../util/error'
import {
    copyDirectory,
    getGitIgnoredFileNames,
    isDirectoryExists,
    removeDirectory,
} from '../util/fs'

const copySourceDirectories = async (options: Options) => {
    console.log('Copying source directories...')
    await handleAllSettled(
        options.paths.map((path: string) => {
            const ignoredFiles = getGitIgnoredFileNames(path)

            return copyDirectory({
                sourceDir: path,
                targetDir: `${options.output}/${path}`,
                ignoredFiles,
            })
        })
    )
}

const copyRootFiles = async (sourcePath: string, outputPath: string) => {
    console.log(`Copying root files from ${sourcePath}...`)
    const ignoredFiles = getGitIgnoredFileNames(sourcePath)
    await copyDirectory({
        sourceDir: sourcePath,
        targetDir: outputPath,
        ignoredFiles,
        options: {
            recursive: false,
            move: true,
        },
    })
}

export const copySourceProjects = async (options: Options) => {
    if (isDirectoryExists(options.output)) {
        if (options.force) {
            removeDirectory(options.output)
        } else {
            throw new Error(
                'Output directory already exists. Use -f or --force to overwrite.'
            )
        }
    }

    await copySourceDirectories(options)
    await copyRootFiles(options.paths[0] as string, options.output)
}
