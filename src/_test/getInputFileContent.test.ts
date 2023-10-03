import { describe, expect, it } from 'vitest'
import path from 'path'
import { getInputFileContent } from '../logic/getInputFileContent'

describe('getInputFileContent', () => {
    it('get a valid json', () => {
        const expected = {
            a: 1,
            b: 'hello',
            people: [
                {
                    name: 'John',
                    age: 20,
                },
                {
                    name: 'Jane',
                    age: 30,
                },
            ],
            other: {
                nested: {
                    array: [1, 2, 3],
                },
            },
        }
        const res = getInputFileContent(
            path.join(__dirname, 'test-data/valid.json')
        )
        expect(res).toEqual(expected)
    })

    it('get an invalid json', () => {
        expect(() =>
            getInputFileContent(path.join(__dirname, 'test-data/invalid.json'))
        ).toThrowError()
    })

    it('get an empty json', () => {
        const expected = {}
        const res = getInputFileContent(
            path.join(__dirname, 'test-data/empty.json')
        )
        expect(res).toEqual(expected)
    })

    it('get an empty file', () => {
        expect(() =>
            getInputFileContent(
                path.join(__dirname, 'test-data/no-content.json')
            )
        ).toThrowError()
    })
})
