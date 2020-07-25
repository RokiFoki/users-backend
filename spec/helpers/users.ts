import { AuthenticationController } from './../../api/controllers/authentication';
import { UsersController } from '../../api/controllers/users';
import knex from 'knex';

export class UsersHelper {
    private usersController: UsersController;
    private authController: AuthenticationController;

    constructor(private db: knex<any, unknown[]>) {        
        this.usersController = new UsersController(this.db);   
        this.authController = new AuthenticationController(this.db);
    }

    async createUser(username: string, password: string) {
        await this.authController.tryRegister(username, password);

        return await this.db.select().from('users').where('username', username).limit(1).then(r => r[0]);
    }
}