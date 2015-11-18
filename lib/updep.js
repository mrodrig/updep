'use strict';

var DEBUG_MODE = true;

var path = require('path'),
    fs = require('fs'),
    promise = require('bluebird'),
    requestAsync = promise.promisify(require('request')),
    _ = require('underscore'),
    p = require(path.resolve(__dirname, '../package.json')),
    versionpromises = [],
    clientPackagePath,
    clientPackage;

/**
 * Updates the clientPackage to have the latest version of the package
 * @param pkgName String
 * @param depType String
 * @param response Object
 */
var updateVersion = function (pkgName, depType, response) {
    clientPackage[depType][pkgName] = '~' + response.body.version;
    console.log(' -> Updated ' + pkgName + '@' + response.body.version);
    return ;
};

/**
 * Appends a new promise which is the request to check for the latest version
 * @param depType String
 * @param pkgName String
 */
var checkVersion = function (depType, pkgName) {
    var versionpromise = requestAsync({
        url  : 'http://registry.npmjs.org/{{package}}/latest'.replace(/{{package}}/g, pkgName),
        json : true
    })
    .then(_.partial(updateVersion, pkgName, depType))
    .catch(function (err) { console.log(err.stack); });
    
    versionpromises.push(versionpromise);
};

/**
 * Initiates the promises to check for the latest version of a package
 * Returns a promise that waits for all version requests to be completed
 */
var updatePackages = function () {
    clientPackage = require(path.resolve(clientPackagePath));
    console.log('-> Looking up latest version of all dependencies.');
    _.each(_.keys(clientPackage.dependencies), _.partial(checkVersion, 'dependencies'));
    _.each(_.keys(clientPackage.devDependencies), _.partial(checkVersion, 'devDependencies'));
    return promise.all(versionpromises);
};

/**
 * Writes the updated package back to disk
 */
var writePackage = function () {
    // stringify the package using 4 spaces identation
    var packageStr = JSON.stringify(clientPackage, undefined, 4);
    console.log('-> Writing the updated version to ' + clientPackagePath);
    return fs.writeFileSync(clientPackagePath, packageStr, 'utf8');
};

/**
 * Simple function to print out that the operation is complete.
 */
var notifyCompletion = function () {
    console.log('-> Done.');
    return process.exit(0);
};

/**
 * Simple function to print out the proper usage
 */
var printUsage = function () {
    console.log('  UPDEP Usage:');
    console.log('    -h                    :: Print usage/help information');
    console.log('    -p <path_to_package>  :: Runs updep on the provided package.json\n');
    return process.exit(0);
};

/**
 * Simple function to print out the info string and return the initial promise
 */
var printInfo = function () {
    console.log('updep v' + p.version + ' ::: An automated way to update your dependencies.\n');
    return promise.resolve();
};

/**
 * Simple function to notify users of invalid input and print the usage
 */
var invalidInput = function () {
    console.log('  ERROR: Did not detect valid input\n');
    printUsage();
    return process.exit(1);
};

/**
 * Function which handles the provided input
 */
var handleInputs = function () {
    var argv = process.argv.slice(2), // remove the cmd and script name
        argc = argv.length;
        
    // if one argument and help flag
    if (argc === 1 && (argv[0] === '-h' || argv[0] === 'h')) {
        return printUsage();
    }
    // else if 2 arguments, first is package path flag
    else if (argc === 2 && argv[0] === '-p' && argv[1]) {
        clientPackagePath = argv[1];
        return updatePackages();
    } 
    // else invalid input
    else {
        return invalidInput();
    }
};

/**
 * Default catch-all error handler
 */
var catchAllErrorHandler = function (err) {
    if (DEBUG_MODE) {
        console.log(err.stack);
    } else {
        console.log('An error occurred during execution.', err);
    }
    return process.exit(1);
};

// Run the dependency upgrade script
printInfo()
.then(handleInputs)
.then(writePackage)
.then(notifyCompletion)
.catch(catchAllErrorHandler);