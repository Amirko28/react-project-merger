import {
    copyDirectory,
    generateIndexFile,
    getGitIgnoredFileNames,
} from './util'
import { OptionsSchema } from '.'
import { rmSync } from 'fs'

export const mergeProjects = async (options: OptionsSchema) => {
    if (options.force) {
        rmSync(options.output, { recursive: true, force: true })
    }

    const results = await Promise.allSettled(
        options.paths.map((path) => {
            const filesToIgnore = getGitIgnoredFileNames(path)
            // if (options.debug) console.log({ filesToIgnore })
            return copyDirectory(
                path,
                `${options.output}/${path}`,
                filesToIgnore
            )
        })
    )

    results.forEach((res) => {
        if (res.status === 'rejected') {
            throw new Error(res.reason)
        }
    })

    generateIndexFile(options.paths, options.output, options.javascript)
}
