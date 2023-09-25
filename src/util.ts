import { existsSync, mkdirSync } from 'fs'

export const createDirectory = (path: string) => {
    if (existsSync(path)) {
        throw new Error('Directory already exists')
    } else {
        mkdirSync(path, { recursive: true })
    }
}
