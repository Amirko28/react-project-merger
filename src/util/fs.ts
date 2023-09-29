import { existsSync, readFileSync, writeFile } from 'fs'
import path from 'path'
import { glob } from 'glob'
import fsExtra from 'fs-extra'
import { handleAllSettled } from './error'

interface CopyParams {
    sourceDir: string
    targetDir: string
    ignoredFiles: string[]
    recursive?: boolean
}

export const copyDirectory = async ({
    sourceDir,
    targetDir,
    ignoredFiles = [],
    recursive = true,
}: CopyParams) => {
    const sourceFiles = glob.sync(recursive ? '**/*' : '*', {
        cwd: sourceDir,
        ignore: ignoredFiles.map((exp) =>
            exp.endsWith('/') ? `${exp}*` : exp
        ),
        nodir: true,
    })

    await handleAllSettled(
        sourceFiles.map((sourceFile) => {
            const sourcePath = path.join(sourceDir, sourceFile)
            const targetPath = path.join(targetDir, sourceFile)

            return fsExtra.copy(sourcePath, targetPath)
        })
    )
}

const capitalizeSnakeCase = (str: string) =>
    str
        .split('_')
        .map((str) => str[0]!.toUpperCase() + str.slice(1))
        .join('')

const indexTemplate = (paths: string[]) =>
    paths
        .map((path) => `import ${capitalizeSnakeCase(path)} from './${path}';`)
        .join('\n')

export const generateIndexFile = (
    sourcePaths: string[],
    targetPath: string,
    isJavascript: boolean
) => {
    console.log('Generating index file...')
    writeFile(
        `${targetPath}/index.${isJavascript ? 'js' : 'ts'}`,
        indexTemplate(sourcePaths),
        (err) => {
            if (err) throw err
        }
    )
}

export const getGitIgnoredFileNames = (path: string) => {
    const gitIgnorePath = `${path}/.gitignore`
    return existsSync(gitIgnorePath)
        ? readFileSync(gitIgnorePath)
              .toString()
              .split('\n')
              .map((str) => str.trim())
              .filter((str) => str && !str.startsWith('#'))
        : []
}
