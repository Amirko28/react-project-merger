import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { generateMergedProjectSrcCode } from '../logic'
import { Options } from '../options'
import {
    mergedPath,
    src1Path,
    src1PathSrc,
    src2Path,
    src2PathSrc,
} from './test-data/paths'
import {
    existsSync,
    mkdirSync,
    readdirSync,
    rmSync,
    statSync,
    writeFileSync,
} from 'fs'
import path from 'path'
import { getJsonContentFromFile } from '../util/fs'

const packageJsonContent = `{
    "name": "src1",
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "tsc && vite build",
        "lint": "eslint . --ext ts,tsx",
        "preview": "vite preview"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
    },
    "devDependencies": {
        "@types/react": "^18.2.15",
        "@types/react-dom": "^18.2.7",
        "@typescript-eslint/eslint-plugin": "^6.0.0",
        "@typescript-eslint/parser": "^6.0.0",
        "@vitejs/plugin-react": "^4.0.3",
        "eslint": "^8.45.0",
        "eslint-plugin-react-hooks": "^4.6.0",
        "eslint-plugin-react-refresh": "^0.4.3",
        "typescript": "^5.0.2",
        "vite": "^4.4.5"
    }
}
`

const baseOptions: Options = {
    paths: [src1Path, src2Path],
    output: mergedPath,
    debug: false,
    force: false,
    appFilePath: 'src/App',
    javascript: false,
}

const getNonDirectoriesFiles = (directoryPath: string): string[] =>
    readdirSync(directoryPath)
        .map((name) => path.join(directoryPath, name))
        .filter((name) => !statSync(name).isDirectory())

describe('generateMergedProjectSrcCode', () => {
    beforeAll(() => {
        if (existsSync('./tmp')) {
            rmSync('./tmp', { recursive: true, force: true })
        }
    })

    beforeEach(() => {
        const dirs = [
            mergedPath,
            src1PathSrc,
            src2PathSrc,
            path.join(mergedPath, src1PathSrc),
            path.join(mergedPath, src2PathSrc),
        ]
        dirs.forEach((path) => {
            mkdirSync(path, {
                recursive: true,
            })
        })

        writeFileSync(
            path.join(mergedPath, '/package.json'),
            packageJsonContent
        )

        writeFileSync(path.join(src1PathSrc, '/index.ts'), 'export const a = 1')
        writeFileSync(path.join(src1Path, '/package.json'), packageJsonContent)
        writeFileSync(
            path.join(mergedPath, src1PathSrc, '/index.ts'),
            'export const a = 1'
        )
        writeFileSync(
            path.join(mergedPath, src1Path, '/package.json'),
            packageJsonContent
        )

        writeFileSync(path.join(src2PathSrc, '/index.ts'), 'export const b = 2')
        writeFileSync(
            path.join(mergedPath, src2PathSrc, '/index.ts'),
            'export const b = 2'
        )
    })
    afterEach(() => {
        rmSync('./tmp', { recursive: true, force: true })
    })

    it('should generate router, app and index files', () => {
        const options = baseOptions
        generateMergedProjectSrcCode(options)

        const nonDirectoriesFiles = getNonDirectoriesFiles(
            path.join(mergedPath, src1Path)
        ).concat(getNonDirectoriesFiles(path.join(mergedPath, src2Path)))

        expect(
            nonDirectoriesFiles.some((file) => existsSync(file)),
            'source directories root files were not deleted'
        ).toBe(false)

        const packageJsonContent = getJsonContentFromFile(
            path.join(mergedPath, '/package.json')
        )

        expect(
            existsSync(path.join(mergedPath, '/src')),
            'merged/src directory was not created'
        ).toBe(true)
        expect(
            Object.keys(
                packageJsonContent.dependencies as Record<string, string>
            ).includes('react-router-dom'),
            'react-router-dom not found in package.json'
        ).toBe(true)
        expect(
            existsSync(path.join(mergedPath, `${baseOptions.appFilePath}.tsx`)),
            'App.tsx not found'
        ).toBe(true)
        expect(
            existsSync(path.join(mergedPath, '/src/index.tsx')),
            'index.tsx not found'
        ).toBe(true)
        expect(
            existsSync(path.join(mergedPath, '/index.html')),
            'index.html not found'
        ).toBe(true)
    })

    it('should generate App.jsx and index.jsx if --javascript is passed', () => {
        const options: Options = { ...baseOptions, javascript: true }
        generateMergedProjectSrcCode(options)

        expect(
            existsSync(path.join(mergedPath, `${baseOptions.appFilePath}.jsx`))
        ).toBe(true)
        expect(existsSync(path.join(mergedPath, '/src/index.jsx'))).toBe(true)
    })
})
