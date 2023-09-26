import {
    copyFileSync,
    existsSync,
    lstatSync,
    mkdirSync,
    readdirSync,
    rmSync,
    writeFile,
} from 'fs'
import path from 'path'
import { OptionsSchema } from '.'

const createDirectory = (path: string, overwrite: boolean) => {
    if (!existsSync(path)) {
        mkdirSync(path, { recursive: true })
    } else {
        if (overwrite) {
            rmSync(path, { recursive: true })
            mkdirSync(path, { recursive: true })
        } else {
            throw new Error('Directory already exists')
        }
    }
}

export const copyDirectory = (from: string, to: string, overwrite = false) => {
    createDirectory(to, overwrite)
    for (const file of readdirSync(from)) {
        const fromPath = path.join(from, file)
        const toPath = path.join(to, file)
        const stat = lstatSync(fromPath)
        if (stat.isDirectory()) {
            copyDirectory(fromPath, toPath)
        } else {
            copyFileSync(fromPath, toPath)
        }
    }
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

export const generateIndexFile = (options: OptionsSchema) => {
    writeFile(
        `${options.output}/index.ts`,
        indexTemplate(options.paths),
        (err) => {
            if (err) throw err
        }
    )
}
