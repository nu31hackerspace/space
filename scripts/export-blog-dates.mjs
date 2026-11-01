/** Export stable blog dates for Docker builds that do not contain Git history. */
import { readdirSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { firstCommitDate, repositoryRoot } from './blog-commit-date.mjs'

const blogDirectory = join(repositoryRoot, 'content/blog')
const dates = {}

for (const name of readdirSync(blogDirectory).filter((file) =>
    file.endsWith('.md')
)) {
    const filePath = join(blogDirectory, name)
    const date = firstCommitDate(filePath)
    if (!date) throw new Error(`Git creation date unavailable for ${name}`)
    dates[relative(repositoryRoot, filePath)] = date
}

writeFileSync(
    join(repositoryRoot, '.blog-dates.generated.json'),
    JSON.stringify(dates)
)
