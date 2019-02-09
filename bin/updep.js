'use strict';

let program = require('commander'),
    pkg = require('../package.json'),
    utilities = require('./utils/utilities.js'),
    VERBOSE = false;

program
    .version(pkg.version, '-v, --version')
    .usage('<package.json> [options]')
    .option('-p, --version-prefix <prefix>', 'Optional package version prefix to prepend', '^')
    .option('-s, --indent-spaces <num_spaces>', 'Number of spaces of indentation for package.json', 4)
    .option('-i, --version-increment [level]', 'Version increment level', 'patch')
    .option('-V, --verbose', 'Verbose mode', false)
    .option('-U, --upgrade-level [level]', 'Dependency version upgrade level', 'major')
    .on('--help', utilities.printExamples)
    .parse(process.argv);

function validateOptions() {
    if (!(program.args && program.args.length)) {
        return invalidOption('No package path provided.');
    }

    const validIncrementLevels = ['major', 'minor', 'patch'];
    if (!validIncrementLevels.includes(program.versionIncrement)) {
        return invalidOption('Invalid version increment level provided. Valid levels are: ' + validIncrementLevels);
    }
    if (!validIncrementLevels.includes(program.upgradeLevel)) {
        return invalidOption('Invalid dependency version upgrade increment level provided. Valid levels are: ' + validIncrementLevels);
    }

    VERBOSE = program.verbose;

    return Promise.resolve({
        packagePath: program.args && program.args.length && program.args[0],
        package: {}, // populated later once the package is read and parsed
        options: {
            indentationSpaces: parseInt(program.indentSpaces, 10),
            versionPrefix: program.versionPrefix,
            versionIncrement: program.versionIncrement,
            dependencyUpgradeLevel: program.upgradeLevel
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
