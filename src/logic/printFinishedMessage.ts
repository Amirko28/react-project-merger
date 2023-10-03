import { getUserPkgManager } from '../util/getUserPkgManager'

export const printFinishedMessage = (outputPath: string) => {
    const packageManager = getUserPkgManager()
    const installCommand = `${packageManager} install`
    console.log(`
Finished!

To continue, run:
cd ${outputPath}
${installCommand}`)
}
