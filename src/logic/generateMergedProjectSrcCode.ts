import { Options } from '../options'
import {
    createSrcDirectory,
    deleteSourceDirectoriesRootFiles,
    generateIndexFile,
    generateRouterComponent,
} from '../util/fs'

export const generateMergedProjectSrcCode = (options: Options) => {
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
