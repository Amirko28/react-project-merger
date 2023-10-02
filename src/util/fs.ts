import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { glob } from 'glob'
import fsExtra, { readJSONSync } from 'fs-extra'
import { handleAllSettled } from './error'

export const removeDirectory = (path: string) => {
    rmSync(path, { recursive: true, force: true })
}

interface CopyOptions {
    recursive: boolean
    move: boolean
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
    options = { recursive: true, move: false },
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

            if (options.move) {
                const pathToDelete = path.join(targetDir, sourcePath)
                removeDirectory(pathToDelete)
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

const routerTemplate = (paths: string[], appFilePath: string) =>
    `import React from 'react';\n`.concat(
        paths
            .map(
                (path) =>
                    `import ${capitalizeSnakeCase(
                        path
                    )} from '../${path}/${appFilePath}';`
            )
            .join('\n')
    ).concat(`\n\n
const App = () => {
    return (
        <div>
            ${paths
                .map((path) => `<${capitalizeSnakeCase(path)} />`)
                .join('\n\t\t\t')}
        </div>
    )
};
        
export default App;`)

export const createSrcDirectory = (outputPath: string) => {
    mkdirSync(path.join(outputPath, 'src'), { recursive: true })
}

interface GenerateRouterParams {
    sourcePaths: string[]
    targetPath: string
    options: {
        isJavascript: boolean
        appFilePath: string
    }
}

export const generateRouterComponent = ({
    sourcePaths,
    targetPath,
    options: { isJavascript, appFilePath },
}: GenerateRouterParams) => {
    console.log('Generating router component...')
    // Using 'add-dependencies' to add react-router-dom to package.json without installing it
    execSync(
        `add-dependencies ${path.join(
            targetPath,
            'package.json'
        )} react-router-dom`
    )
    writeFileSync(
        path.join(targetPath, 'src', `App.${isJavascript ? 'jsx' : 'tsx'}`),
        routerTemplate(sourcePaths, appFilePath)
    )
}

const indexTemplate = () =>
    `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)`

const htmlTemplate = (indexPath: string) => `
<!DOCTYPE html>
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
    const indexRelatievPath = path.join('src', indexFileName)
    const indexPath = path.join(targetPath, indexRelatievPath)
    writeFileSync(indexPath, indexTemplate())

    console.log('Generating index.html...')
    const indexHtmlPath = path.join(targetPath, 'index.html')
    writeFileSync(indexHtmlPath, htmlTemplate(indexRelatievPath))
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

export const getJsonContentFromFile = (path: string) =>
    readJSONSync(path, 'utf-8') as Record<string, unknown>
