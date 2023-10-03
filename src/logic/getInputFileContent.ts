import { getJsonContentFromFile } from '../util/fs'

export const getInputFileContent = (path: string) =>
    getJsonContentFromFile(path)
