import { join, resolve } from 'path'
import { checkBunIsInstalled } from './cmd'
import { existsSync, renameSync, writeFileSync } from 'fs'
import fsExtra from 'bunw/compiled/fs-extra'
import { execSync } from 'child_process'
import chalk from 'bunw/compiled/chalk'

const postinstall = async () => {
  if (!process.env.SKIP_BUNW_LOCAL_CHECK) {
    const lockFile = join(__dirname, '../pnpm-lock.yaml')
    const isLocal = existsSync(lockFile)
    if (isLocal) {
      console.log(chalk.green(`Bun is installed locally.`))
      return
    }
    const installInfo = await checkBunIsInstalled()
    if (installInfo.install) {
      return
    }
  }
  // install bun package
  const installDir = join(__dirname, '../npm-install')
  const installPkgPath = join(installDir, 'package.json')
  // auto install
  const autoInstall = async () => {
    if (existsSync(installDir)) {
      await fsExtra.remove(installDir)
    }
    await fsExtra.mkdirp(installDir)
    writeFileSync(installPkgPath, '{}', 'utf-8')
    const env = { ...process.env, npm_config_global: undefined }
    const version = 'latest'
    const pkgName = 'bun'
    execSync(
      `npm install --no-save --loglevel=error --prefer-offline --no-audit --progress=false ${pkgName}@${version}`,
      { cwd: installDir, stdio: 'pipe', env },
    )
    const installedBinPath = join(installDir, 'node_modules', pkgName)
    const npmCwdPath = process.env.INIT_CWD
    if (!npmCwdPath) {
      throw new Error('INIT_CWD is not found.')
    }
    if (process.env.DEBUG) {
      console.log(`INIT_CWD: ${npmCwdPath}`)
    }
    const targetPath = resolve(npmCwdPath, 'node_modules', pkgName)
    if (!existsSync(targetPath)) {
      await fsExtra.mkdirp(targetPath)
    }
    // INIT_CWD is injected via npm. If it doesn't exists, can't proceed.
    renameSync(installedBinPath, targetPath)
  }
  try {
    console.log(chalk.yellow(`Not found bun package, auto install...`))
    await autoInstall()
  } catch (e) {
    console.log(
      chalk.red(`Auto install bun package failed, please install it manually:`),
    )
    console.log(chalk.blue(`  curl -fsSL https://bun.sh/install | bash`))
    console.log(`    or`)
    console.log(chalk.blue(`  pnpm i -g bun`))
  } finally {
    if (existsSync(installDir)) {
      await fsExtra.remove(installDir)
    }
  }
}

postinstall().catch((e) => {
  throw e
})
