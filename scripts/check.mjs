/**
 * 对随包发布的每个 JS 产物做语法检查。
 *
 * `node --check` 一次只接受一个文件，而 `files` 里的产物分布在 lib/ 与 lib/types/ 下，
 * 所以这里递归收集后逐个检查。刻意不引第三方依赖：本脚本要在 CI 里、在没跑过
 * install 的干净 checkout 上执行。
 *
 * 为什么值得单列一步：本插件的产物是手工同步的（构建链未随仓库提交），
 * 手改 lib/ 时最容易漏改一处；而产物里的语法错误在浏览器侧表现为
 * 「插件整个静默不加载」，排查成本极高。
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

/** 需要检查的产物根目录。 */
const ROOTS = ['lib']

/** 递归收集 `root` 下的所有 .js 文件。 */
function collectJs (root) {
  const found = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (entry.isFile() && entry.name.endsWith('.js')) found.push(path)
    }
  }
  if (statSync(root).isDirectory()) walk(root)
  return found
}

const files = ROOTS.flatMap(collectJs).sort()
if (files.length === 0) {
  console.error('check: no built JS artifacts found under ' + ROOTS.join(', '))
  process.exit(1)
}

for (const file of files) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' })
  console.log('ok ' + relative(process.cwd(), file))
}
console.log(`checked ${files.length} file(s)`)
