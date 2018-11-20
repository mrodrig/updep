var promise = require('bluebird'),
    path = require('path'),
    p = require(path.resolve(__dirname, '../package.json'));

var utilities = {
    /**
     * Simple function to print out the proper usage
     */
    printUsage : function () {
        console.log('UPDEP Usage:');
        console.log('  -h                    :: Print usage/help information');
        console.log('  -p <path_to_package>  :: Runs updep on the provided package.json');
        console.log('  -vp <version_prefix>  :: Specifies a version prefix string.');
        console.log('  -sp <num_spaces>      :: Specifies a number of spaces of identation for the new package.json');
        console.log('  -inc                  :: Specifies to increment the patch version (ie. 0.0.0 -> 0.0.1)');
        console.log('');
        return process.exit(0);
    },

    /**
     * Simple function to print out the info string and return the initial promise
     */
    printInfo : function () {
        console.log('updep v' + p.version + ' ::: An automated way to update your dependencies.\n');
        return promise.resolve();
    },
    
    /**
     * Simple function to notify users of invalid input and print the usage
     */
    invalidInput : function () {
        console.log('  ERROR: Did not detect valid input\n');
        utilities.printUsage();
        return process.exit(1);
    },
    
    /**
     * Simple function to print out that the operation is complete.
     */
    notifyCompletion : function () {
        console.log('-> Done.');
        return process.exit(0);
    }
};

module.exports = utilities;