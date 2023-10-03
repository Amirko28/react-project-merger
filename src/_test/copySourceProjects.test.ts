import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import path from 'path'
import { copySourceProjects } from '../logic/copySourceProjects'
import { Options } from '../options'

const src1Path = './tmp/src1'
const src1PathSrc = './tmp/src1/src'
const src2Path = './tmp/src2'
const src2PathSrc = './tmp/src2/src'
const mergedPath = './tmp/merged'

const baseOptions: Options = {
    paths: [src1Path, src2Path],
    output: mergedPath,
    debug: false,
    force: false,
    appFilePath: 'src/App',
    javascript: false,
}

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

describe('copySourceProjects', () => {
    beforeEach(() => {
        mkdirSync(src1PathSrc, {
            recursive: true,
        })
        writeFileSync(path.join(src1PathSrc, '/index.ts'), 'const a = 1')
        writeFileSync(path.join(src1Path, '/package.json'), packageJsonContent)
        mkdirSync(src2PathSrc, {
            recursive: true,
        })
        writeFileSync(path.join(src2PathSrc, '/index.ts'), 'const b = 2')
    })

    afterEach(() => {
        rmSync('./tmp', { recursive: true, force: true })
    })

    it('should generate a merged directory and merged/package.json from src1', async () => {
        const options = baseOptions
        await copySourceProjects(options)

        expect(existsSync(mergedPath)).toBe(true)
        expect(existsSync(path.join(mergedPath, 'package.json'))).toBe(true)
    })

    it('should fail if merged path already exists and --force is not passed', () => {
        mkdirSync(mergedPath, {
            recursive: true,
        })

        const options = baseOptions

        void expect(
            async () => await copySourceProjects(options)
        ).rejects.toThrowError()
    })

    it('should overwrite existing folder if --force is passed', async () => {
        mkdirSync(mergedPath, {
            recursive: true,
        })

        const options: Options = { ...baseOptions, force: true }
        await copySourceProjects(options)

        expect(existsSync(path.join(mergedPath, 'package.json'))).toBe(true)
    })
})
