class Command {
    execute( command ) {
        return this[command] && this[command].apply( this, [].slice.call(arguments, 1) );
    }
}

module.exports = Command;
