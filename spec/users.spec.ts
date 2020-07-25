import { UsersController } from './../api/controllers/users';
import "jasmine";

import knex from 'knex';
import mockDb from 'mock-knex';

const db = knex({
    client: 'pg'
});

const tracker = mockDb.getTracker();

let controller: UsersController;

describe("Users Controller", () => {
    beforeAll((done) => {
        mockDb.mock(db);
        controller = new UsersController(db);
        done();
    });

    beforeEach((done) => {
        tracker.install();
        done();
    })

    afterEach((done) => {
        tracker.uninstall();
        done();
    })

    afterAll((done) => {
        mockDb.unmock(db);
        done();
    })

    describe("getting users data", () => {
        it("successful getting", async () => {
            tracker.once('query', (query) => {
                query.response([{username: 'username', likes: 10}]);
            });

            const response = await controller.get(1);
            expect(response.success).toBeTrue();
            expect(response.user).toBeTruthy();
        });
        
        it("unknown userId", async () => {
            const response = await controller.get(undefined);

            expect(response.success).toBeFalse();
            expect(response.reason).toEqual('Unknown user.');
        });

        it("user doesnt exist", async () => {
            tracker.once('query', (query) => {
                query.response([]);
            });

            const response = await controller.get(2);

            expect(response.success).toBeFalse();
            expect(response.reason).toEqual("User doesn't exist.");
        });

        it('unexpected error', async () => {
            tracker.once('query', (query) => {
                query.reject('db error');
            });

            await expectAsync(controller.get(2)).toBeRejected();
        }); 
    });

    describe("like", () => {
        it("successful like", async () => {
            tracker.once('query', (query) => {
                query.response([])
            });

            const response = await controller.addLike(1, 1);
            expect(response.success).toBeTrue();
        });
        
        it("unknown originator", async () => {
            const response = await controller.addLike(undefined, 1);
            expect(response.success).toBeFalse();
            expect(response.reason).toEqual('You need to be logged in.');
        });

        it("unknown likeId", async () => {
            const response = await controller.addLike(1, undefined);
            expect(response.success).toBeFalse();
            expect(response.reason).toEqual(`The user doesn't exist.`);
        });

        it("like already exists", async () => {
            tracker.on('query', (query, step) => {
                if (step === 1) {
                    query.reject('constraint error');
                } else if (step === 2) {
                    query.response({'originator_id' : 1, 'liked_id': 2});
                }
            });

            const response = await controller.addLike(1, 2);
            expect(response.success).toBeFalse();
            expect(response.reason).toEqual(`The like already exists.`);
        });

        it("unknown error", async () => {
            tracker.on('query', (query, step) => {
                if (step === 1) {
                    query.reject('constraint error');
                } else if (step === 2) {
                    query.response(undefined);
                }
            });

            await expectAsync(controller.addLike(1, 2)).toBeRejected();
        });
    });

    describe("unlike", () => {
        it("successful like", async () => {
            tracker.once('query', (query) => {
                query.response([])
            });

            const response = await controller.deleteLike(1, 1);
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

        it("unknown error", async () => {
            tracker.on('query', (query, step) => {
                if (step === 1) {
                    query.reject('constraint error');
                } else if (step === 2) {
                    query.response(undefined);
                }
            });

            await expectAsync(controller.addLike(1, 2)).toBeRejected();
        });
    });
});