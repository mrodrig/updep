'use strict';

const path = require('path'),
    {readFileSync, writeFileSync} = require('fs'),
    semver = require('semver'),
    axios = require('axios');

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
    switch (params.options.dryRun) {
        case true:
            console.log('  Analyzing %s:', listKey);
            break;
        case false:
        default:
            console.log('  -> Starting to update %s', listKey);
    }
    if (params.package[listKey]) {
        let dependencies = Object.keys(params.package[listKey]);
        return Promise.all(
            dependencies.map((packageName) => getAllVersions(packageName)
                .then((versions) => findNewVersionForUpgrade({
                    versions: versions,
                    currentVersion: params.package[listKey][packageName],
                    dependencyUpgradeLevel: params.options.dependencyUpgradeLevel
                }))
                .then((newVersion) => {
                    newVersion = constructVersionNumber(params.options.versionPrefix, newVersion);
                    switch (params.options.dryRun) {
                        case true:
                            console.log('      ' + packageName + ':    ' + params.package[listKey][packageName] + ' --> ' + newVersion);
                            return;
                        case false:
                        default:
                            params.package[listKey][packageName] = newVersion;
                            console.log('    -> Updated %s@%s', packageName, newVersion);
                    }

                }))
        )
            .then(() => params);
    }
    return params;
}

async function getAllVersions(packageName) {
    const response = await axios.get(`http://registry.npmjs.org/${packageName}`)
    
    return {
        latest: response.data['dist-tags'].latest,
        all: Object.keys(response.data.versions)
    };
}

function findNewVersionForUpgrade(params) {
    let newVersion = getAllMatchingVersions(params);

    switch (params.dependencyUpgradeLevel) {
        case 'patch':
        case 'minor':
            return newVersion;
        case 'major':
        default:
            return params.versions.latest;
    }
}

function stripVersionPrefixes(currentVersion) {
    return currentVersion
        .replace('^', '')
        .replace('~', '');
}

function getAllMatchingVersions(params) {
    const [major, minor] = stripVersionPrefixes(params.currentVersion).split('.'),
        minorVersionTest = new RegExp('^' + major + '\\.\\d*\\.\\d*'),
        patchVersionTest = new RegExp('^' + major + '\\.' + minor + '\\.\\d*');

    switch (params.dependencyUpgradeLevel) {
        case 'patch':
            return params.versions.all
                .filter((version) => patchVersionTest.test(version))
                .slice(-1)
                .pop();
        case 'minor':
        default:
            return params.versions.all
                .filter((version) => minorVersionTest.test(version))
                .slice(-1)
                .pop();
    }
}

function constructVersionNumber(prefix, versionNumber) {
    return prefix + versionNumber;
}

function doneUpdating(params) {
    if (!params.options.dryRun) {
        console.log('  -> Done updating dependencies and devDependencies.');
    }
    return params;
}

function incrementPackageVersion(params) {
    if (!params.options.dryRun) {
        params.package.version = semver.inc(params.package.version, params.options.versionIncrement);
        console.log('-> Updated version to: %s', params.package.version);
    }
    return params;
}

function processPackage(params) {
    // Convert the package to a JSON string with the specified indentation
    if (!params.options.dryRun) {
        params.package = JSON.stringify(params.package, null, params.options.indentationSpaces);
    }
    return params;
}

function writePackage(params) {
    if (!params.options.dryRun) {
        console.log('-> Writing the updated version to %s', params.packagePath);
        writeFileSync(params.packagePath, params.package, 'utf8');
    }
    return params;
}

/**
 * Simple function to print out that the operation is complete.
 */
function notifyCompletion() {
    console.log('-> Done.');
    return process.exit(0);
}
