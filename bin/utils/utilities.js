'use strict';

const path = require('path'),
    {readFileSync, writeFileSync} = require('fs'),
    promise = require('bluebird'),
    semver = require('semver'),
    request = promise.promisify(require('request'));

module.exports = {
    printExamples,
    convertToAbsolutePath,
    readPackage,
    parsePackage,
    updateDependencies: (params) => updateDeps(params, 'dependencies'),
    updateDevDependencies: (params) => updateDeps(params, 'devDependencies'),
    doneUpdating,
    incrementPackageVersion,
    processPackage,
    writePackage,
    notifyCompletion
};

function printExamples() {
    console.log('');
    console.log('Examples:');
    console.log('  $ updep --help');
    console.log('  $ updep -h');
    console.log('  $ updep package.json -p ^ -i minor');
    console.log('  $ updep package.json -p "~" -s 4 -i major');
}

function convertToAbsolutePath(params) {
    if (params.packagePath && !path.isAbsolute(params.packagePath)) {
        params.packagePath = path.join(process.cwd(), params.packagePath);
    }
    return params;
}

function readPackage(params) {
    console.log('-> Reading package from: %s', params.packagePath);
    params.package = readFileSync(params.packagePath).toString();
    return params;
}

function parsePackage(params) {
    if (params.package) {
        params.package = JSON.parse(params.package);
        console.log('-> Parsed package.');
    }
    console.log('-> Beginning upgrade for %s@%s', params.package.name || 'unnamed', params.package.version || 'unknown');
    return params;
}

function updateDeps(params, listKey) {
    console.log('  -> Starting to update %s', listKey);
    if (params.package[listKey]) {
        let dependencies = Object.keys(params.package[listKey]);
        return Promise.all(
            dependencies.map((packageName) => getLatestVersion(packageName)
                .then((latestVersion) => {
                    params.package[listKey][packageName] = constructVersionNumber(params.options.versionPrefix, latestVersion);
                    console.log('    -> Updated %s@%s', packageName, latestVersion);
                }))
        )
            .then(() => params);
    }
    return params;
}

function getLatestVersion(packageName) {
    return request({
        url: 'http://registry.npmjs.org/' + packageName,
        json: true
    })
        .then((response) => response.body['dist-tags'].latest);
}

function constructVersionNumber(prefix, versionNumber) {
    return prefix + versionNumber;
}

function doneUpdating(params) {
    console.log('  -> Done updating dependencies and devDependencies.');
    return params;
}

function incrementPackageVersion(params) {
    params.package.version = semver.inc(params.package.version, params.options.versionIncrement);
    console.log('-> Updated version to: %s', params.package.version);
    return params;
}

function processPackage(params) {
    // Convert the package to a JSON string with the specified indentation
    params.package = JSON.stringify(params.package, null, params.options.indentationSpaces);
    return params;
}

function writePackage(params) {
    console.log('-> Writing the updated version to %s', params.packagePath);
    writeFileSync(params.packagePath, params.package, 'utf8');
    return params;
}

/**
 * Simple function to print out that the operation is complete.
 */
function notifyCompletion() {
    console.log('-> Done.');
    return process.exit(0);
}
