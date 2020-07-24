import { AuthenticationController } from '../api/controllers/authentication';
import "jasmine";

import knex from 'knex';
import mockDb from 'mock-knex';

const db = knex({
    client: 'pg'
});

const tracker = mockDb.getTracker();

let controller: AuthenticationController;

describe("Authentication Controller", () => {
    beforeAll((done) => {
        mockDb.mock(db);
        controller = new AuthenticationController(db);
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

    describe("login", () => {
        it("user doesnt exist", async () => {
            tracker.once('query', (query) => {
                query.response([]);
            });

            const response = await controller.tryLogin('unknownUser', '');
            expect(response.success).toBeFalse();
            expect(response.reason).toEqual("That username doens't exist.");
        });
        
        it("user exist, but incorrect password", async () => {
            tracker.once('query', (query) => {
                query.response([{
                    'id': 1, 
                    'credentials_hash': 'hash', 
                    'username': 'knownUser'
                }]);
            });

            const response = await controller.tryLogin('knownUser', '12345');
            expect(response.success).toBeFalse();
            expect(response.reason).toEqual('Incorrect password.');
        });

        it("user exist with correct password", async () => {
            tracker.once('query', (query) => {
                query.response([{
                    'id': 1, 
                    'credentials_hash': '$6$rounds=5000$Pl0xN0Sh4re$YwlwsRp4eOtz5ef4jWOny2wruSTZhhg./8IM9.s53.TjIbcVDECDkw0/x8SatGDZcanLJuTwlbGUGnYiExKuN0', 
                    'username': 'knownUser'
                }]);
            });

            const response = await controller.tryLogin('knownUser', '12345');
            expect(response.success).toBeTrue();
        });

        it("unknown error", async () => {
            tracker.once('query', (query) => {
                query.reject('db error');
            });

            await expectAsync(controller.tryLogin('knownUser', '12345')).toBeRejected();
        });
    });

    describe("register", () => {
        it("successful registration", async () => {
            tracker.on('query', (query, step) => {
                if (step === 1) { query.response([]); } // begin transaction
                else if (step === 2) {
                    query.response(1); // insert
                } else {
                    query.response([]);
                }
            });

            const response = await controller.tryRegister('newUser', '12345');
            expect(response.success).toBeTrue();
            expect(response.token).toBeTruthy();
        });
        
        it("username already exists", async () => {
            const username = 'newUser';
            tracker.on('query', (query, step) => {
                if (step === 1) { query.response([]); } // begin transaction
                else if (step === 2) {
                    query.reject('db error'); // insert
                } else if (step === 3) { query.response([]); } // rollback
                else {
                    query.response([{username: username}]);
                }
            });

            const response = await controller.tryRegister(username, '12345');

            expect(response.success).toBeFalse();
            expect(response.token).toBeFalsy();
            expect(response.reason).toEqual('Username already in use.');
        });

        it("unknown error", async () => {
            const username = 'newUser';
            tracker.on('query', (query, step) => {
                if (step === 1) { query.response([]); } // begin transaction
                else if (step === 2) {
                    query.reject('db error'); // insert
                } else if (step === 3) { query.response([]); } // rollback
                else {
                    query.response([]);
                }
            });

            await expectAsync(controller.tryRegister(username, '12345')).toBeRejected();
        });
    });
});