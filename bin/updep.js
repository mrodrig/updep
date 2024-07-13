#!/usr/bin/env node

'use strict';

let { program } = require('commander'),
    pkg = require('../package.json'),
    utilities = require('./utils/utilities.js'),
    VERBOSE = false;

program
    .version(pkg.version)
    .usage('<package.json> [options]')
    .option('-p, --version-prefix <prefix>', 'Optional package version prefix to prepend', '^')
    .option('-s, --indent-spaces <num_spaces>', 'Number of spaces of indentation for package.json', 4)
    .option('-i, --version-increment [level]', 'Package.json version increment level {major|minor|patch}', 'patch')
    .option('-v, --verbose', 'Verbose mode', false)
    .option('-U, --upgrade-level [level]', 'Dependency version upgrade level {major|minor|patch}', 'major')
    .option('-D, --dry-run', 'Show the upgrades that would be performed instead of upgrading', false)
    .on('--help', utilities.printExamples)
    .parse(process.argv);

const options = program.opts();

function validateOptions() {
    if (!(program.args && program.args.length)) {
        return invalidOption('No package path provided.');
    }

    console.log('ARGS', options);

    const validIncrementLevels = ['major', 'minor', 'patch'];
    if (!validIncrementLevels.includes(options.versionIncrement)) {
        return invalidOption('Invalid version increment level provided. Valid levels are: ' + validIncrementLevels);
    }
    if (!validIncrementLevels.includes(options.upgradeLevel)) {
        return invalidOption('Invalid dependency version upgrade increment level provided. Valid levels are: ' + validIncrementLevels);
    }

    VERBOSE = options.verbose;

    return Promise.resolve({
        packagePath: program.args && program.args.length && program.args[0],
        package: {}, // populated later once the package is read and parsed
        options: {
            indentationSpaces: parseInt(options.indentSpaces, 10),
            versionPrefix: options.versionPrefix,
            versionIncrement: options.versionIncrement,
            dependencyUpgradeLevel: options.upgradeLevel,
            dryRun: options.dryRun
        }
    });
}

validateOptions()
    .then(utilities.convertToAbsolutePath)
    .then(utilities.readPackage)
    .then(utilities.parsePackage)
    .then(utilities.updateDependencies)
    .then(utilities.updateDevDependencies)
    .then(utilities.doneUpdating)
    .then(utilities.incrementPackageVersion)
    .then(utilities.processPackage)
    .then(utilities.writePackage)
    .then(utilities.notifyCompletion)
    .catch(catchAllErrorHandler);

function invalidOption(message) {
    return catchAllErrorHandler(message);
}

/**
 * Default catch-all error handler
 */
function catchAllErrorHandler(err) {
    if (VERBOSE) {
        console.error(err.stack);
    } else {
        console.error('An error occurred during execution.', err);
    }
    return process.exit(1);
}
