const dbmsCommand = require('../../commands/dbms.command');

let commander, original, mutations;

/**
 * Since i was requested to send a production like code, i'd like to add a comment here:
 * I'm only testing the command class functionality since this is the implementation of functionality that i was requested
 * to send, i know that i'll be probably missing a lot of unit tests to deliver a production like code but i've been
 * busy and i already got a message that if i've sent the email delivering my code,
 * so i just want you to know to know that i'm aware
 * of adding more unit tests to give more reliability and of course integrations test, to do the e2e flow.
 * However i tried to cover the main flows of the DBMS and the normal edge cases we should usually expect to happen,
 * but stuff like efficiency, fault tolerance would be kinda missing from this unit tests
 */

describe('DBMS Command Unit Tests', () => {
    beforeEach(() => {
        original = require('../data/original');
        mutations = require('../data/mutations');
        jest.resetModules();
        commander = new dbmsCommand;
    });
    describe('Default checks', () => {
       describe('Empty params', () => {

           it('Empty document and Empty mutations', () => {
               const response = commander.execute('generateUpdateStatement', original, mutations);

               expect(response).toHaveProperty('original', {});
               expect(response).toHaveProperty('updated', {});
               expect(response).toHaveProperty('trace', []);
               expect(response).toHaveProperty('traceAsString', []);
           });

           it('Not empty document and Empty mutations', () => {
               original['value'] = true;
               const response = commander.execute('generateUpdateStatement', original, mutations);

               expect(response).toHaveProperty('original', original);
               expect(response).toHaveProperty('updated', original);
               expect(response).toHaveProperty('trace', []);
               expect(response).toHaveProperty('traceAsString', []);
           });

           it('Empty document and Not empty mutations', () => {
               mutations['value'] = true;
               const response = commander.execute('generateUpdateStatement', original, mutations);

               expect(response).toHaveProperty('original', original);
               expect(response).toHaveProperty('updated', original);
               expect(response).toHaveProperty('trace', []);
               expect(response).toHaveProperty('traceAsString', []);
           });

           it('Not empty document and Not empty mutations', () => {
               original['value'] = true;
               mutations['value'] = true;
               const response = commander.execute('generateUpdateStatement', original, mutations);

               expect(response).toHaveProperty('original', original);
               expect(response).toHaveProperty('updated', original);
               expect(response).toHaveProperty('trace', []);
               expect(response).toHaveProperty('traceAsString', []);
           });
       });
       describe('Strange params', () => {
           it('Invalid document', () => {
               let original = undefined;
               expect(() => {
                   commander.execute('generateUpdateStatement', original, mutations);
               }).toThrow();
           });

           it('Invalid mutations', () => {
               let mutations = undefined;

               const response = commander.execute('generateUpdateStatement', original, mutations);

               expect(response).toHaveProperty('original', {});
               expect(response).toHaveProperty('updated', {});
               expect(response).toHaveProperty('trace', []);
               expect(response).toHaveProperty('traceAsString', []);
           });
       });
    });
    describe('One operation', () => {
        describe('Insert', () => {
            beforeEach(() => {
                original = {
                    _id: 1, name: 'someName', posts: []
                };
            });

            it('Should return success inserting one valid item on first level,', () => {
                mutations = {
                    posts: [{ 'title': 'myPost'}]
                };
                const response = commander.execute('generateUpdateStatement', original, mutations);

                expect(response.original.posts).toHaveLength(0);
                expect(response.updated.posts).toHaveLength(1);
                expect(response.updated.posts[0]).toHaveProperty('title', 'myPost');
                expect(response.traceAsString[0]).toBe('{"$ADD":{"posts":{"title":"myPost"}}}');
            });

            it('Should return success inserting one valid item on deep level,', () => {
                original.posts = [
                    {_id : 1,
                    comments : []}
                ];
                mutations = {
                    posts: [{_id:1, comments:[{ 'comment': 'newComment'}]}]
                };

                const response = commander.execute('generateUpdateStatement', original, mutations);

                expect(response.original.posts[0].comments).toHaveLength(0);
                expect(response.updated.posts[0].comments).toHaveLength(1);
                expect(response.updated.posts[0].comments[0]).toHaveProperty('comment', 'newComment');
                expect(response.traceAsString[0]).toBe('{"$ADD":{"posts.1.comments":{"comment":"newComment"}}}');
            });

            it('Should return error because invalid path', () => {
                mutations = {
                    posts: [{_id:1, newProp:[{ 'comment': 'newComment'}]}]
                };

                expect(() => {
                    commander.execute('generateUpdateStatement', original, mutations);
                }).toThrow('No path available to insert');
            });

            it('Should return error because inserting on invalid _id', () => {
                original.posts = [
                    {_id : 1,
                        comments : []}
                ];
                mutations = {
                    posts: [{_id:2, comments:[{ 'comment': 'newComment'}]}]
                };

                expect(() => {
                    commander.execute('generateUpdateStatement', original, mutations);
                }).toThrow('No path available to insert');
            });
        });

        describe('Update', () => {
            beforeEach(() => {
                original = {
                    _id: 1, name: 'someName', posts: [{_id:1, name:'name'}]
                };
            });

            it('Should return success updating one valid item on first level,', () => {
                mutations = {
                    posts: [{_id:1, 'name': 'cesar'}]
                };
                const response = commander.execute('generateUpdateStatement', original, mutations);

                expect(response.original.posts).toHaveLength(1);
                expect(response.updated.posts).toHaveLength(1);
                expect(response.updated.posts[0]).toHaveProperty('name', 'cesar');
                expect(response.traceAsString[0]).toBe('{"$UPDATE":{"posts.1":{"_id":1,"name":"cesar"}}}');
            });

            it('Should return success updating one valid item on deep level,', () => {
                original.posts = [
                    {_id : 1,
                        comments : [{_id:1, name:'name'}]}
                ];
                mutations = {
                    posts: [{_id:1, comments:[{_id:1, 'name': 'cesar'}]}]
                };

                const response = commander.execute('generateUpdateStatement', original, mutations);

                expect(response.original.posts[0].comments).toHaveLength(1);
                expect(response.updated.posts[0].comments).toHaveLength(1);
                expect(response.updated.posts[0].comments[0]).toHaveProperty('name', 'cesar');
                expect(response.traceAsString[0]).toBe('{"$UPDATE":{"posts.1.comments.1":{"_id":1,"name":"cesar"}}}');
            });

            it('Should return error because invalid key', () => {
                mutations = {
                    posts: [{_id:1, lastname:'lastname'}]
                };

                expect(() => {
                    commander.execute('generateUpdateStatement', original, mutations);
                }).toThrow('Key to update not found!');
            });

            it('Should return error because invalid _id', () => {
                mutations = {
                    posts: [{_id:2, name:'lastname'}]
                };

                expect(() => {
                    commander.execute('generateUpdateStatement', original, mutations);
                }).toThrow('No path available to update');
            });

            it('Should return error because empty value', () => {
                mutations = {
                    posts: [{_id:1, name:''}]
                };

                expect(() => {
                    commander.execute('generateUpdateStatement', original, mutations);
                }).toThrow('Updating values can\'t be empty');
            });
        });

        describe('Delete', () => {
            beforeEach(() => {
                original = {
                    _id: 1, name: 'someName', posts: [{_id:1, name:'name'}]
                };
            });

            it('Should return success deleting one valid item on first level,', () => {
                mutations = {
                    posts: [{_id:1, _delete: true}]
                };
                const response = commander.execute('generateUpdateStatement', original, mutations);

                expect(response.original.posts).toHaveLength(1);
                expect(response.updated.posts).toHaveLength(0);
                expect(response.traceAsString[0]).toBe('{"$DELETE":{"posts.1":true}}');
            });

            it('Should return success deleting one valid item on deep level,', () => {
                original.posts = [
                    {_id : 1,
                        comments : [{_id:1, name:'name'}]}
                ];
                mutations = {
                    posts: [{_id:1, comments:[{_id:1, _delete: true}]}]
                };

                const response = commander.execute('generateUpdateStatement', original, mutations);

                expect(response.original.posts[0].comments).toHaveLength(1);
                expect(response.updated.posts[0].comments).toHaveLength(0);
                expect(response.traceAsString[0]).toBe('{"$DELETE":{"posts.1.comments.1":true}}');
            });

            it('Should return error because invalid _id', () => {
                mutations = {
                    posts: [{_id:2, _delete:true}]
                };

                expect(() => {
                    commander.execute('generateUpdateStatement', original, mutations);
                }).toThrow('Item to delete not found');
            });

            it('Should return error because invalid _delete statement', () => {
                mutations = {
                    posts: [{_id:1, _delete:'string'}]
                };

                expect(() => {
                    commander.execute('generateUpdateStatement', original, mutations);
                }).toThrow('Invalid value for _delete key or false');
            });

            it('Should return error because false _delete statement', () => {
                mutations = {
                    posts: [{_id:1, _delete:false}]
                };

                expect(() => {
                    commander.execute('generateUpdateStatement', original, mutations);
                }).toThrow('Invalid value for _delete key or false');
            });

            it('Should return error because empty value', () => {
                mutations = {
                    posts: [{_id:1, name:''}]
                };

                expect(() => {
                    commander.execute('generateUpdateStatement', original, mutations);
                }).toThrow('Updating values can\'t be empty');
            });
        });
    })
});
