const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('creating windows installer')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'release-builds')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'wiinsta-win32-ia32/'),
    authors: 'Linch1',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'wiinsta.exe',
    setupExe: 'WiinstaInstaller.exe',
    setupIcon: path.join(rootPath, 'icons', 'win', 'icon.ico')
  })
}