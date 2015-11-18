var path = require('path'),
    Promise = require('bluebird'),
    requestAsync = Promise.promisify(require('request')),
    _ = require('underscore'),
    p = require(path.resolve(__dirname, '../package.json')),
    clientPackage,
    versionPromises = [];

/**
 * Updates the clientPackage to have the latest version of the package
 * @param options {pkgName: String, depType: String, latest: String}
 */
var updateVersion = function (pkgName, depType, response) {
    clientPackage[depType][pkgName] = '~' + response.body.version;
    console.log(' -> Updated ' + pkgName);
    return ;
}

var checkVersion = function (depType, pkgName) {
    var versionPromise = requestAsync({
        url  : 'http://registry.npmjs.org/{{package}}/latest'.replace(/{{package}}/g, pkgName),
        json : true
    })
    .then(_.partial(updateVersion, pkgName, depType))
    .catch(function (err) { console.log(err.stack); })
    
    versionPromises.push(versionPromise);
};

var print_usage = function () {
    console.log('  UPDEP Usage:');
    console.log('    -h                    :: Print usage/help information');
    console.log('    -p <path_to_package>  :: Runs updep on the provided package.json');
};

var main = function () {
    console.log('updep v' + p.version + ' ::: An automated way to update your dependencies.\n');
    var argv = process.argv.slice(2), // remove the cmd and script name
        argc = argv.length;
        
    // if one argument and help flag
    if (argc === 1 && (argv[0] === '-h' || argv[0] === 'h')) {
        return print_usage();
    } else if (argc === 2 && argv[0] === '-p' && argv[1]) {
        clientPackage = require(path.resolve(argv[1]));
        console.log('-> Looking up latest version of all dependencies.');
        // todo create promises and merge the two arrays
        var t = _.each(_.keys(clientPackage.dependencies), _.partial(checkVersion, 'dependencies'));
        _.each(_.keys(clientPackage.devDependencies), _.partial(checkVersion, 'devDependencies'));
        // todo write the clientPackage back out
        
    } else {
        console.log('  ERROR: Did not detect valid input\n');
        return print_usage();
    }
    
    
};

main();