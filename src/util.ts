import { existsSync, mkdirSync, readFileSync, writeFile } from 'fs'
import path from 'path'
import { glob } from 'glob'
import fsExtra from 'fs-extra'

const createDirectory = (path: string) => {
    if (existsSync(path)) {
        throw new Error('Directory already exists')
    } else {
        mkdirSync(path, { recursive: true })
    }
}

export const copyDirectory = async (
    sourceDir: string,
    targetDir: string,
    ignoredFiles: string[] = []
) => {
    const sourceFiles = glob.sync('**/*', {
        cwd: sourceDir,
        ignore: ignoredFiles.map((exp) =>
            exp.endsWith('/') ? `${exp}*` : exp
        ),
        nodir: true,
    })

    await Promise.allSettled(
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
