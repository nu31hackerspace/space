/** Resolve the first Git commit date of a blog file. */
import { execFileSync } from 'node:child_process'
import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))

/** Return the date when a file first entered Git, following renames. */
export function firstCommitDate(filePath) {
    const path = relative(repositoryRoot, filePath)
    try {
        const history = execFileSync(
            'git',
            ['log', '--follow', '--diff-filter=A', '--format=%cI', '--', path],
            {
                cwd: repositoryRoot,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore'],
            }
        ).trim()
        return history.split(/\r?\n/).filter(Boolean).at(-1)
    } catch {
        return undefined
    }
}
