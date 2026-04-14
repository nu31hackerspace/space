import { createError } from 'h3'

// Enforces that the given userId is the owner of the post.
// Throws 403 if the post has no owner_id or the owner does not match.
// Used in PUT and DELETE handlers to prevent editing or deleting other users' posts.
export function assertPostOwner(post: { owner_id?: string }, userId: string): void {
    if (post.owner_id !== userId) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }
}
