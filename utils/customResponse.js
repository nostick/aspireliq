const _ = require('lodash');
const deepClean = require('clean-deep');
const cleanOptions = {
    emptyArrays: false
}

class dbmsResponse {
    constructor(originalDocument){
        this.original = originalDocument || {};
        this.updated = {};
        this.trace = [];
    }

    setUpdatedDocument(updatedDocument){
        this.updated = updatedDocument || {};
        return this;
    }

    insertTrace(type, path, data){
        let trace = {
            [type] : {
                [path]: (type === '$DELETE') ? true: data
            }
        };
        this.trace.push(trace);
        return this;
    }

    getResponse(){
        return {
            traceAsString: this.trace.map(trace => JSON.stringify(trace)),
            trace: this.trace,
            original: deepClean(this.original, cleanOptions),
            updated: deepClean(this.updated, cleanOptions)
        }
    }
}

module.exports = dbmsResponse
