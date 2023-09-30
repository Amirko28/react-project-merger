import { existsSync, readFileSync, rmSync, writeFileSync } from 'fs'
import path from 'path'
import { glob } from 'glob'
import fsExtra from 'fs-extra'
import { handleAllSettled } from './error'

interface CopyOptions {
    recursive: boolean
    deleteOnCopy: boolean
}

interface CopyParams {
    sourceDir: string
    targetDir: string
    ignoredFiles: string[]
    options?: Partial<CopyOptions>
}

export const copyDirectory = async ({
    sourceDir,
    targetDir,
    ignoredFiles = [],
    options = { recursive: true, deleteOnCopy: false },
}: CopyParams): Promise<string[]> => {
    const sourceFiles = glob.sync(options.recursive ? '**/*' : '*', {
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

            if (options.deleteOnCopy) {
                const pathToDelete = path.join(targetDir, sourcePath)
                rmSync(pathToDelete, { recursive: true, force: true })
            }

            return fsExtra.copy(sourcePath, targetPath)
        })
    )

    return sourceFiles
}

const capitalizeSnakeCase = (str: string) =>
    str
        .split('_')
        .map((str) => str[0]!.toUpperCase() + str.slice(1))
        .join('')

const routerTemplate = (paths: string[], mainFileName: string) =>
    `import React from 'react';\n`.concat(
        paths
            .map(
                (path) =>
                    `import ${capitalizeSnakeCase(
                        path
                    )} from './${path}/${mainFileName}';`
            )
            .join('\n')
    ).concat(`\n\n
const Main = () => {
    return (
        <div>
            ${paths
                .map((path) => `<${capitalizeSnakeCase(path)} />`)
                .join('\n\t\t\t')}
        </div>
    )
};
        
export default Main;`)

interface GenerateRouterParams {
    sourcePaths: string[]
    targetPath: string
    options: {
        isJavascript: boolean
        mainFileName: string
    }
}

export const generateRouterComponent = ({
    sourcePaths,
    targetPath,
    options: { isJavascript, mainFileName },
}: GenerateRouterParams) => {
    console.log('Generating router component...')
    writeFileSync(
        `${targetPath}/main.${isJavascript ? 'jsx' : 'tsx'}`,
        routerTemplate(sourcePaths, mainFileName)
    )
}

const indexTemplate = () =>
    `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './main';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)`

const htmlTemplate = (indexPath: string) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Merged App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${indexPath}"></script>
  </body>
</html>`

interface GenerateIndexParams {
    targetPath: string
    isJavascript: boolean
}

export const generateIndexFile = ({
    targetPath,
    isJavascript,
}: GenerateIndexParams) => {
    const indexFileName = `index.${isJavascript ? 'jsx' : 'tsx'}`

    console.log(`Generating ${indexFileName} file...`)
    const indexPath = `${targetPath}/${indexFileName}`
    writeFileSync(indexPath, indexTemplate())

    console.log('Generating index.html...')
    writeFileSync('index.html', htmlTemplate(indexPath))
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
