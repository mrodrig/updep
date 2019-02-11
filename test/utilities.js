'use strict';

const { lstatSync, readdirSync } = require('fs'),
    { join } = require('path');

module.exports = {
    getDirectories
};

function isDirectory(source) {
    return lstatSync(source.path).isDirectory();
}

function getDirectories(source) {
    return readdirSync(source).map((name) => ({
        name: name,
        path: join(source, name)
    }))
        .filter(isDirectory);
}
