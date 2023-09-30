import { rmSync } from 'fs'
import {
    copyDirectory,
    generateIndexFile,
    generateRouterComponent,
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
    await moveRootFiles(options.paths[0] as string, options.output)
    generateRouterComponent({
        sourcePaths: options.paths,
        targetPath: options.output,
        options: {
            isJavascript: options.javascript,
            mainFileName: options.mainFileName,
        },
    })
    generateIndexFile({
        targetPath: options.output,
        isJavascript: options.javascript,
    })
}
const moveRootFiles = async (sourcePath: string, outputPath: string) => {
    console.log(`Moving root files from ${sourcePath}...`)
    const ignoredFiles = getGitIgnoredFileNames(sourcePath)
    await copyDirectory({
        sourceDir: sourcePath,
        targetDir: outputPath,
        ignoredFiles,
        options: {
            recursive: false,
            deleteOnCopy: true,
        },
    })
}
