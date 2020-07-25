import HTTP from 'http-status-codes';

import knex from 'knex';

export class UsersController {
    constructor(private db: knex<any, unknown[]>) {}

    async get(id?: number) {
        if (!id) {
            return {
                success: false,
                user: undefined,
                reason: 'Unknown user.'
            }
        }

        const user = await this.db.select('users.username')
            .countDistinct('likes.originator_id', { as: 'likes'})
            .from('users')
            .leftJoin('likes', 'users.id', '=', 'likes.liked_id')
            .where('users.id', id)
            .groupBy('users.username')
            .limit(1).then(r => r[0]);

        if (!!user) {
            return {
                success: true,
                user,
                reason: undefined
            }
        } 

        return {
            success: false,
            reason: "User doesn't exist.",
            status: HTTP.NOT_FOUND
        }
    }

    async addLike(userId?: number, likedUserId?: number) {
        if (!userId) {
            return {
                success: false,
                reason: 'You need to be logged in.'
            }
        }

        if (!likedUserId) {
            return {
                success: false,
                reason: `The user doesn't exist.`
            }
        }

        try {
            await this.db.insert({
                originator_id: userId,
                liked_id: likedUserId
            }).into('likes');

            return {
                success: true,            
                reason: undefined
            }
        } catch (err) {
            const like = await this.db.select(['originator_id', 'liked_id']).from('likes')
                .where('originator_id', userId)
                .where('liked_id', likedUserId);

            if (!!like) {
                return {
                    success: false,
                    reason: 'The like already exists.'
                }
            }

            throw err;
        }
    }

    async deleteLike(userId?: number, likedUserId?: number) {
        if (!userId) {
            return {
                success: false,
                reason: 'You need to be logged in.'
            }
        }

        if (!likedUserId) {
            return {
                success: false,
                reason: `The user doesn't exist.`
            }
        }

        await this.db.delete()
            .from('likes')
            .where('originator_id', userId)
            .where('liked_id', likedUserId);
        
        return {
            success: true,            
            reason: undefined
        }
    }

    async getMostLiked(take?: number, page?: number) {
        let query = this.db.select(['users.username', 'users.id'])
            .countDistinct('likes.originator_id', { as: 'likes'})
            .from('users')
            .leftJoin('likes', 'users.id', '=', 'likes.liked_id')
            .groupBy(['users.username', 'users.id'])
            .orderBy('likes', 'desc')

            if (take) {
                query = query.limit(take);

                if (page) {
                    query = query.offset((page-1) * take);
                }
            }            

            return await query;
    }

}