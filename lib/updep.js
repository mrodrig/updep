'use strict';

var DEBUG_MODE = true;

var path = require('path'),
    fs = require('fs'),
    promise = require('bluebird'),
    requestAsync = promise.promisify(require('request')),
    _ = require('underscore'),
    p = require(path.resolve(__dirname, '../package.json')),
    utilities = require('./utilities.js'),
    versionPromises = [],
    clientOptions = {
        versionPrefix : '~',
        numSpaces     : 4
    },
    clientPackage;

/**
 * Updates the clientPackage to have the latest version of the package
 * @param pkgName String
 * @param depType String
 * @param response Object
 */
var updateVersion = function (pkgName, depType, response) {
    clientPackage[depType][pkgName] = clientOptions.versionPrefix + response.body.version;
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
    
    versionPromises.push(versionpromise);
};

/**
 * Initiates the promises to check for the latest version of a package
 * Returns a promise that waits for all version requests to be completed
 */
var updatePackages = function () {
    clientPackage = require(path.resolve(clientOptions.packagePath));
    console.log('-> Looking up latest version of all dependencies.');
    _.each(_.keys(clientPackage.dependencies), _.partial(checkVersion, 'dependencies'));
    _.each(_.keys(clientPackage.devDependencies), _.partial(checkVersion, 'devDependencies'));
    return promise.all(versionPromises);
};

/**
 * Writes the updated package back to disk
 */
var writePackage = function () {
    if (clientOptions.incrementPackageVersion) {
        var patchVersionIndex = clientPackage.version.lastIndexOf('.') + 1;
        var patchVersion = parseInt(clientPackage.version.substring(patchVersionIndex), 10);
        clientPackage.version = clientPackage.version.substring(0, patchVersionIndex) + (++patchVersion);
        console.log('-> Updated package.json version to: ' + clientPackage.version);
    }
    
    // stringify the package using 4 spaces identation
    var packageStr = JSON.stringify(clientPackage, undefined, clientOptions.numSpaces);
    console.log('-> Writing the updated version to ' + clientOptions.packagePath);
    return fs.writeFileSync(clientOptions.packagePath, packageStr, 'utf8');
};

/**
 * Function to parse the flags from the command line
 * @param argv String[]
 */
var parseFlags = function (argv) {
    while (argv.length) {
        var twoOrMoreArgs = argv.length >= 2;
        if (argv[0] === '-h' || argv[0] === 'h') {
            return utilities.printUsage();
        } else if (argv[0] === '-p' && twoOrMoreArgs) {
            clientOptions.packagePath = argv[1];
            argv.splice(0, 2);
            continue; 
        } else if (argv[0] === '-vp' && twoOrMoreArgs) {
            clientOptions.versionPrefix = argv[1];
            argv.splice(0, 2);
            continue;
        } else if (argv[0] === '-sp' && twoOrMoreArgs) {
            clientOptions.numSpaces = parseInt(argv[1], 10);
            argv.splice(0, 2);
            continue;
        } else if (argv[0] === '-inc') {
            clientOptions.incrementPackageVersion = true;
            argv.splice(0, 1);
            continue;
        } else {
            return utilities.invalidInput();
        }
    }
    return clientOptions;
};

/**
 * Function which handles the provided input
 */
var handleInput = function () {
    return process.argv.slice(2); // remove the cmd and script name
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
utilities.printInfo()
.then(handleInput)
.then(parseFlags)
.then(updatePackages)
.then(writePackage)
.then(utilities.notifyCompletion)
.catch(catchAllErrorHandler);