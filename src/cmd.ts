import { execa } from 'bunw/compiled/execa'
import { existsSync } from 'fs'
import chalk from 'bunw/compiled/chalk'
import { dirname, join } from 'path'

export const createBunCmdShortcut = (name?: string) => {
  return async () => {
    const argv = process.argv.slice(2) || []
    await cmd(['--bun', ...(name?.length ? [name] : []), ...argv])
  }
}

export const cmd = async (cmd: string[]) => {
  const installInfo = await checkBunIsInstalled(true)
  if (!installInfo.install) {
    throw new Error('Bun is not installed')
  }
  // run cmd
  const bunPath = installInfo.path!
  const cwd = process.cwd()
  try {
    await execa(bunPath, cmd, {
      cwd,
      stdio: 'inherit',
    })
  } catch {}
}

interface IInstall {
  install: boolean
  path?: string
}

export const checkBunIsInstalled = async (
  showHelperInfo: boolean = false,
): Promise<IInstall> => {
  try {
    if (process.env.BUNW_SKIP_BUN_GLOBAL_CHECK) {
      throw new Error('skip global check')
    }
    const ret = await execa('bun', ['--version'])
    const out = ret.stdout
    if (out?.length && out?.includes('.')) {
      // check old version
      checkOldVersion(out)
      return {
        install: true,
        path: 'bun',
      }
    }
  } catch (e) {
    const hasBunPkg = () => {
      const bunPkg = require.resolve('bun/package.json', {
        paths: [process.cwd()],
      })
      if (!existsSync(bunPkg)) {
        return false
      }
      const bunBinPath = join(dirname(bunPkg), 'bin/bun')
      if (!existsSync(bunBinPath)) {
        return false
      }
      // check old version
      const bunVersion = require(bunPkg).version
      checkOldVersion(bunVersion)
      return bunBinPath
    }
    try {
      const bunPath = hasBunPkg()
      if (bunPath) {
        return {
          install: true,
          path: bunPath,
        }
      }
    } catch {}
  }
  const helper = () => {
    const isGithubCI = process.env.GITHUB_ACTIONS
    if (!isGithubCI) {
      console.log(
        chalk.red(`Bun is not installed. Please manually install it:`),
      )
      console.log(chalk.blue(`  curl -fsSL https://bun.sh/install | bash`))
      console.log('    or')
      console.log(chalk.blue(`  npm install -g bun`))
    } else {
      console.log(`Bun is not installed. Please add to github actions:`)
      console.log(chalk.blue(`  - uses: oven-sh/setup-bun@v1`))
      console.log(`Refer: https://bun.sh/guides/runtime/cicd`)
    }
  }
  if (showHelperInfo) {
    helper()
  }
  return {
    install: false,
  }
}

export const checkOldVersion = (version: string) => {
  const isNumber = (v: string) => {
    const asNumber = Number(v)
    return !isNaN(asNumber) && String(asNumber) === v
  }
  const [major, minor, patch] = version.split('.')
  const isAllNumber = isNumber(major) && isNumber(minor) && isNumber(patch)
  // skip check alpha/beta... version
  if (!isAllNumber) {
    return false
  }
  const helper = () => {
    console.log(
      chalk.yellow(`Bun version is too old, please upgrade to latest version.`),
    )
    console.log(
      chalk.yellow(`Current version: ${version}, required version: >= 1.0.15`),
    )
  }
  const isOld =
    Number(major) === 0 ||
    (Number(major) === 1 && Number(minor) === 0 && Number(patch) < 15)
  return isOld
}
