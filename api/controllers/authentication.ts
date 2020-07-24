
import config from '../../config';
import knex from 'knex';

const bcrypt_sha512 = require('sha512crypt-node');

export class AuthenticationController {
    constructor(private db: knex<any, unknown[]>) {}

    async tryRegister(username: string, password: string) {
        try {
            return await this.db.transaction(async (trx) => {
                const userId = (await trx.insert({ username }).into('users').returning('id'));

                const hash = this.getHashedCredentials(+userId, password); 
                
                await trx('users').update({credentials_hash: hash}).where('id', +userId);
    
                const token = this.createToken(username, +userId);
    
                return { success: true, token: token, reason: undefined};
            });
        }
        catch(err) {
            const users = await this.db.select('username').from('users').where('userame', username).limit(1);

            if (users && users.length) {
                return { success: false, reason: 'Username already in use.', token: undefined };
            }

            throw err;
        }
    }

    private getHashedCredentials(userId: number, password: string) {
        return this.hash(this.getCredentials(userId, password));
    }

    private getCredentials(userId: number, password: string) {
        return userId + ':' + password;
    }

    private hash(value: string) {
        return bcrypt_sha512.sha512crypt(value, `\$6\$rounds=${config.rounds}\$${config.salt}`);
    }

    private createToken(name: string, userId: number) {
        return {
            userId: userId,
            name: name
        };
    }

    async tryLogin(username: string, password: string) {
        const users = await this.db.select('id', 'credentials_hash', 'username').from('users').where('username', username).limit(1);

        if (!users || !users.length) {
            return {
                success: false, 
                reason: `That username doens't exist.`
            }
        }

        const user = users[0];

        const credentials = this.getCredentials(user.id, password);
        const success =  this.validateCredentials(credentials, user.credentials_hash)
    
        if (!success) {
            return { success: false, reason: 'Incorrect password.' };
        }
        
        var token = this.createToken(user.username, user.id);
                    
        return { success: true, token: token }; 
    }

    async changePassword(userId?: number, password?: string) {
        if (!userId) {
            return {
                success: false,
                reason: 'Unknown user.'
            }
        }

        if (!password) {
            return {
                success: false,
                reason: 'Password is empty.'
            }
        }

        const success = (+await this.db('users').update({
            credentials_hash: this.getHashedCredentials(userId, password)
        }).where('id', userId).returning('id')) === userId;

        if (!success) {
            return {
                success,
                reason: `Couldn't find the user.`
            }
        } 

        return {
            success,
            reason: undefined
        }        
    }

    private validateCredentials(credentialsToBeVerified: string, hash: string){
        const authenticationHash = bcrypt_sha512.sha512crypt(credentialsToBeVerified, hash)
        return hash === authenticationHash;
    }
}