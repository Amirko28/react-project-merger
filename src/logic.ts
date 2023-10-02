import { z } from 'zod'
import {
    copyDirectory,
    createSrcDirectory,
    generateIndexFile,
    generateRouterComponent,
    getGitIgnoredFileNames,
    getJsonContentFromFile,
    removeDirectory,
} from './util/fs'
import { OptionsSchema } from '.'
import { handleAllSettled } from './util/error'
import { getUserPkgManager } from './util/getUserPkgManager'

export const getInputFileContent = (path: string) =>
    getJsonContentFromFile(path)

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
        removeDirectory(options.output)
    }

    await copySourceDirectories(options)
    await moveRootFiles(options.paths[0] as string, options.output)
    createSrcDirectory(options.output)
    generateRouterComponent({
        sourcePaths: options.paths,
        targetPath: options.output,
        options: {
            isJavascript: options.javascript,
            appFileName: options.appFilePath,
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
            move: true,
        },
    })
}

export const printFinishedMessage = (outputPath: string) => {
    const packageManager = getUserPkgManager()
    const installCommand = `${packageManager} install`
    console.log(`
Finished!

To continue, run:
cd ${outputPath}
${installCommand}`)
}
