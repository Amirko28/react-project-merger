import { afterEach, describe, expect, it, vi } from 'vitest'
import { getFinishedMessage } from '../logic/getFinishedMessage'
import { PackageManager, getUserPkgManager } from '../util/getUserPkgManager'

describe('getFinishedMessage', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('should print correct merged project path', () => {
        const mergedPath = 'merged-path'
        const res = getFinishedMessage(mergedPath, getUserPkgManager())
        expect(res).toContain(`cd ${mergedPath}`)
    })

    it('should print correct install command - npm', () => {
        const packageManager: PackageManager = 'npm'
        const mockFn = vi.fn(() => packageManager)
        const res = getFinishedMessage('merged-path', mockFn())
        expect(res).toContain(`${packageManager} install`)
    })

    it('should print correct install command - pnpm', () => {
        const packageManager: PackageManager = 'pnpm'
        const mockFn = vi.fn(() => packageManager)
        const res = getFinishedMessage('merged-path', mockFn())
        expect(res).toContain(`${packageManager} install`)
    })

    it('should print correct install command - yarn', () => {
        const packageManager: PackageManager = 'yarn'
        const mockFn = vi.fn(() => packageManager)
        const res = getFinishedMessage('merged-path', mockFn())
        expect(res).toContain(`${packageManager} install`)
    })

    it('should print correct install command - bun', () => {
        const packageManager: PackageManager = 'bun'
        const mockFn = vi.fn(() => packageManager)
        const res = getFinishedMessage('merged-path', mockFn())
        expect(res).toContain(`${packageManager} install`)
    })
})
