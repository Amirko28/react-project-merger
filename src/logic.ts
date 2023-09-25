import { createDirectory } from './util'
import { OptionsSchema } from '.'

export const mergeProjects = (options: OptionsSchema) => {
    createDirectory(options.output)
}
