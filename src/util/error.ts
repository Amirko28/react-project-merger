export const handleAllSettled = async <TValue>(promises: Promise<TValue>[]) => {
    const results = await Promise.allSettled(promises)

    results.forEach((res) => {
        if (res.status === 'rejected') {
            throw new Error(res.reason as string | undefined)
        }
    })
}
