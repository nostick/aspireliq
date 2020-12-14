const _ = require('lodash');

const dbmsCommand = require('../commands/dbms.command');
const { httpError } = require('../utils/customErrors');

exports.dbms = (req, res) => {
    const dbmsCommander = new dbmsCommand();
    try{
        const { document, mutation } = req.body;

        if(_.isEmpty(document) || _.isEmpty(mutation)) throw new httpError('Params document and mutation required',400);

        const response = dbmsCommander.execute('generateUpdateStatement', document, mutation);

        res.status(200).send(response);
    }catch(e){
        res.status(e.status || 500).send(e.error);
    }
}
