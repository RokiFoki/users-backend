import { AuthenticationController } from './../../api/controllers/authentication';
import "jasmine";
import fs from 'fs';

import knex from 'knex';
import { UsersHelper } from '../helpers/users';

const dbPath = "./spec/integration/testdb.sqlite";

let controller: AuthenticationController;
let usersHelper: UsersHelper;

let db: knex<any, unknown[]>;

describe("Integration Authentication Controller", () => {
    beforeAll(async (done) => {
        if (fs.existsSync(dbPath)) {
            fs.unlinkSync(dbPath);
        }

        db = knex({
            client: 'sqlite3',
            connection: {
                filename: dbPath
            }
        });
        
        await db.migrate.latest();
        
        usersHelper = new UsersHelper(db);
        controller = new AuthenticationController(db);
        done();
    });

    beforeEach(async (done) => {
        await db('users').truncate();
        await db('likes').truncate();

        done();
    });
    
    afterEach(async (done) => {

        done();
    })

    afterAll(async (done) => {
        await db.destroy();
        
        done();
    });

    describe("login", () => {
        it("user doesnt exist", async () => {
            const response = await controller.tryLogin('unknownUser', '');
            expect(response.success).toBeFalse();
            expect(response.reason).toEqual("That username doens't exist.");
        });
        
        it("user exist, but incorrect password", async () => {
            usersHelper.createUser('knownUser', 'abc');

            const response = await controller.tryLogin('knownUser', '12345');
            expect(response.success).toBeFalse();
            expect(response.reason).toEqual('Incorrect password.');
        });

        it("user exist with correct password", async () => {
            usersHelper.createUser('knownUser', '12345');

            const response = await controller.tryLogin('knownUser', '12345');
            expect(response.success).toBeTrue();
        });
    });

    describe("register", () => {
        it("successful registration", async () => {
            const response = await controller.tryRegister('newUser', '12345');
            expect(response.success).toBeTrue();
            expect(response.token).toBeTruthy();
        });
        
        it("username already exists", async () => {
            await controller.tryRegister('username', '12345');
            const response = await controller.tryRegister('username', '12345');

            expect(response.success).toBeFalse();
            expect(response.token).toBeFalsy();
            expect(response.reason).toEqual('Username already in use.');
        });
    });

    describe('changing password', () => {
        it('changing password successfully', async () => {
            const user = await usersHelper.createUser('username', 'abc');
            const response = await controller.changePassword(user.id, '123');

            expect(response.success).toBeTrue();
            expect(response.reason).toBeFalsy();
        });

        
        it('changing password, empty password', async () => {
            const user = await usersHelper.createUser('username', 'abc');
            const response = await controller.changePassword(user.id, '');

            expect(response.success).toBeFalse();
            expect(response.reason).toEqual('Password is empty.');
        });

        it('changing password, undefined user', async () => {
            const response = await controller.changePassword(undefined, '123');

            expect(response.success).toBeFalse();
            expect(response.reason).toEqual('Unknown user.');
        });

        it('changing password, undefined user', async () => {
            const response = await controller.changePassword(-1, '123');

            expect(response.success).toBeFalse();
            expect(response.reason).toEqual(`Couldn't find the user.`);
        });
    });
});