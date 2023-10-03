import { OptionsSchema } from '../options'
import { handleAllSettled } from '../util/error'
import {
    copyDirectory,
    createSrcDirectory,
    deleteSourceDirectoriesRootFiles,
    generateIndexFile,
    generateRouterComponent,
    getGitIgnoredFileNames,
    removeDirectory,
} from '../util/fs'

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

export const mergeProjects = async (options: OptionsSchema) => {
    if (options.force) {
        removeDirectory(options.output)
    }

    await copySourceDirectories(options)
    await copyRootFiles(options.paths[0] as string, options.output)
    deleteSourceDirectoriesRootFiles(options.paths, options.output)
    createSrcDirectory(options.output)
    generateRouterComponent({
        sourcePaths: options.paths,
        targetPath: options.output,
        options: {
            isJavascript: options.javascript,
            appFilePath: options.appFilePath,
        },
    })
    generateIndexFile({
        targetPath: options.output,
        isJavascript: options.javascript,
    })
}
