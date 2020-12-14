const _ = require('lodash');
const Command = require('./command');

const { httpError } = require('../utils/customErrors');
const Response = require('../utils/customResponse');

module.exports = (function () {
    class dbmsCommand extends Command {

        constructor() {
            super();
        }

        generateUpdateStatement(originalDocument, mutations) {
            const dbmsResponse = new Response(originalDocument);
            let newResponse = JSON.parse(JSON.stringify(originalDocument));
            _.forEach(mutations, (node, key) => {
                recursiveProcess(node, key, newResponse, dbmsResponse);
            });
            return dbmsResponse.setUpdatedDocument(newResponse).getResponse();
        }
    }

    function recursiveProcess(operation, baseKey, originalDocument, dbmsResponse) {
        let currentPath = baseKey;
        _.forEach(operation, (op) => {
            if (op._id) {
                currentPath += `.${op._id}`
            }

            const childKey = _.findKey(op, op => _.isArray(op) && !_.isEmpty(op));

            if (childKey) {
                recursiveProcess(op[childKey], `${currentPath}.${childKey}`, originalDocument, dbmsResponse);
            }
            executeOperation(op, currentPath, originalDocument, dbmsResponse);
            currentPath = baseKey;
        });
    }

    function executeOperation(operation, path, originalDocument, dbmsResponse) {
        if (_.find(operation, op => _.isArray(op) && !_.isEmpty(op))) {
            return;
        }

        if (!_.isUndefined(operation._id)) {
            // DELETE OPERATION
            if (!_.isUndefined(operation._delete)) {
                if(!_.isBoolean(operation._delete) || !operation._delete) throw new httpError('Invalid value for _delete key or false');
                return deleteOperation(operation, path, originalDocument, dbmsResponse);
            }

            // UPDATE OPERATION
            return update(operation, path, originalDocument, dbmsResponse);
        }

        // INSERT OPERATION
        return insert(operation, path, originalDocument, dbmsResponse);
    }

    function insert(data, path, originalDocument, dbmsResponse) {
        const nodePath = getNodePath(path, originalDocument);

        //In order to insert i'm assuming the node path has to exist at least empty
        const nodeToInsert = _.get(originalDocument, nodePath);
        if (!nodeToInsert) {
            throw new httpError('No path available to insert', 400);
        }
        dbmsResponse.insertTrace('$ADD', path, data);
        return nodeToInsert.push({_id: nodeToInsert.length + 1, ...data});
    }

    function update(data, path, originalDocument, dbmsResponse) {
        const nodePath = getNodePath(path, originalDocument);

        const nodeToUpdate = _.get(originalDocument, nodePath);
        if(!nodeToUpdate) throw new httpError('No path available to update', 400);

        // I'm assuming it will always find just one key due to the format of the operation
        // Otherwise i'd have to loop over all keys and do an update for each key that match
        const keyToUpdate = _.findKey(data, (value, key) => {
           return (key !== '_id' && _.has(nodeToUpdate, key));
        });

        if(!keyToUpdate) throw new httpError('Key to update not found!', 400);

        if(_.isEmpty(data[keyToUpdate]))
            throw new httpError('Updating values can\'t be empty');

        dbmsResponse.insertTrace('$UPDATE', path, data);
        return nodeToUpdate[keyToUpdate] = data[keyToUpdate];
    }

    function deleteOperation(data, path, originalDocument, dbmsResponse) {
        const nodePath = getNodePath(path, originalDocument, data._id);

        let pathToDelete = nodePath.split('.');
        pathToDelete = pathToDelete.map( (key, index) => {
            if(index % 2 === 0) return `${key}[${pathToDelete[index+1]}]`;
        }).filter(item => item).join('.');

        if(!_.get(originalDocument, pathToDelete)) throw new httpError('Item to delete not found', 500);

        dbmsResponse.insertTrace('$DELETE', path, data);
        return _.unset(originalDocument, pathToDelete);
    }

    function getNodePath(currentPath, originalDocument, id) {
        const array = currentPath.split('.');
        let nodePath = "";
        _.forEach(array, (key, index) => {
            nodePath += key;
            if (parseInt(key)) {
                const charsToCut = (key.toString().length * -1) - 1;
                let keyById = _.chain(originalDocument).get(nodePath.slice(0, charsToCut)).findIndex(item => item._id === parseInt(key)).value();
                nodePath = nodePath.slice(0,-1) + keyById;
            }
            nodePath += '.';
        });

        return nodePath.slice(0, -1);
    }

    return dbmsCommand;
})();
