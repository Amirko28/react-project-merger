import { copyDirectory, generateIndexFile } from './util'
import { OptionsSchema } from '.'

export const mergeProjects = (options: OptionsSchema) => {
    options.paths.forEach((path) => {
        copyDirectory(path, `${options.output}/${path}`, options.force)
    })
    generateIndexFile(options)
}
