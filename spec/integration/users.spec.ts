import { UsersController } from '../../api/controllers/users';
import "jasmine";
import fs from 'fs';

import knex from 'knex';
import { UsersHelper } from '../helpers/users';

const dbPath = "./spec/integration/testdb.sqlite";

let controller: UsersController;
let usersHelper: UsersHelper;

let db: knex<any, unknown[]>;

describe("Integration Users Controller", () => {
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
        controller = new UsersController(db);
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

    describe("getting users data", () => {
        it("successful getting", async () => {
            const user = await usersHelper.createUser('username', 'password');

            const response = await controller.get(user.id);
            expect(response.success).toBeTrue();
            expect(response.user).toBeTruthy();
        });
        
        it("unknown userId", async () => {
            const response = await controller.get(undefined);

            expect(response.success).toBeFalse();
            expect(response.reason).toEqual('Unknown user.');
        });

        it("user doesnt exist", async () => {
            const response = await controller.get(-1);

            expect(response.success).toBeFalse();
            expect(response.reason).toEqual("User doesn't exist.");
        });
    });

    describe("like", () => {
        it("successful like", async () => {
            const user = await usersHelper.createUser('theUsername', 'password');
            const response = await controller.addLike(user.id, user.id);

            expect(response.success).toBeTrue();
        });
        
        it("unknown originator", async () => {
            const user = await usersHelper.createUser('username', 'password');
            const response = await controller.addLike(undefined, user.id);
            expect(response.success).toBeFalse();
            expect(response.reason).toEqual('You need to be logged in.');
        });

        it("unknown likeId", async () => {
            const user = await usersHelper.createUser('username', 'password');
            const response = await controller.addLike(user.id, undefined);
            expect(response.success).toBeFalse();
            expect(response.reason).toEqual(`The user doesn't exist.`);
        });

        it("like already exists", async () => {
            const user = await usersHelper.createUser('username', 'password');
            await controller.addLike(user.id, user.id);
            const response = await controller.addLike(user.id, user.id);
            expect(response.success).toBeFalse();
            expect(response.reason).toEqual(`The like already exists.`);
        });
    });

    describe("unlike", () => {
        it("successful like", async () => {
            const user = await usersHelper.createUser('username', 'password');
            await controller.addLike(user.id, user.id);
            const response = await controller.deleteLike(user.id, user.id);
            expect(response.success).toBeTrue();
        });
        
        it("unknown originator", async () => {
            const response = await controller.deleteLike(undefined, 1);
            expect(response.success).toBeFalse();
            expect(response.reason).toEqual('You need to be logged in.');
        });

        it("unknown likeId", async () => {
            const response = await controller.deleteLike(1, undefined);
            expect(response.success).toBeFalse();
            expect(response.reason).toEqual(`The user doesn't exist.`);
        });
    });

    describe("most-liked", () => {
        it("successful query", async () => {
            const user = await usersHelper.createUser('username', 'password');
            const response = await controller.getMostLiked();
            expect(response).toBeTruthy();
        });

        it("successful query with take", async () => {
            await usersHelper.createUser('username', 'password');
            await usersHelper.createUser('username2', 'password');
            await usersHelper.createUser('username3', 'password');
            const response = await controller.getMostLiked(2);
            expect(response).toBeTruthy();
            expect(response.length).toEqual(2);
        });

        it("successful query with take and 1st page", async () => {
            const user = await usersHelper.createUser('username', 'password');
            await usersHelper.createUser('username2', 'password');
            await usersHelper.createUser('username3', 'password');
            await controller.addLike(user.id, user.id);
            const response = await controller.getMostLiked(2, 1);
            expect(response).toBeTruthy();
            expect(response.length).toEqual(2);
            expect(response.map(u => u.id)).toContain(user.id);
        });

        it("successful query with take and 2nd page", async () => {
            const user = await usersHelper.createUser('username', 'password');
            await usersHelper.createUser('username2', 'password');
            await usersHelper.createUser('username3', 'password');
            await controller.addLike(user.id, user.id);
            const response = await controller.getMostLiked(2, 2);
            expect(response).toBeTruthy();
            expect(response.length).toEqual(1);
            expect(response.map(u => u.id).includes(user.id)).toBeFalse();
        });
    });
});