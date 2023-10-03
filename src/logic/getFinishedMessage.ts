import { PackageManager } from '../util/getUserPkgManager'

export const getFinishedMessage = (
    outputPath: string,
    packageManager: PackageManager
): string => {
    const installCommand = `${packageManager} install`
    return `
Finished!

To continue, run:
cd ${outputPath}
${installCommand}`
}
