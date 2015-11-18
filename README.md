# Automatically upgrade your NPM dependencies to the latest version!

[![Build Status](https://travis-ci.org/mrodrig/updep.svg?branch=master)](https://travis-ci.org/mrodrig/updep)
![David - Dependency Checker Icon](https://david-dm.org/mrodrig/updep.png "updep Dependency Status")
[![Downloads](http://img.shields.io/npm/dm/updep.svg)](https://www.npmjs.org/package/updep)
[![NPM version](https://img.shields.io/npm/v/updep.svg)](https://www.npmjs.org/package/updep)
[![bitHound Score](https://www.bithound.io/github/mrodrig/updep/badges/score.svg)](https://www.bithound.io/github/mrodrig/updep)

This node module will convert an array of JSON documents to a CSV string.
Column headings will be automatically generated based on the keys of the JSON documents. Nested documents will have a '.' appended between the keys.

It is also capable of converting CSV of the same form back into the original array of JSON documents.
The columns headings will be used as the JSON document keys.  All lines must have the same exact number of CSV values.

## Installation

```bash
$ npm install updep
```

## Usage

```bash
updep -p <path_to>/package.json
```

### API

#### Command Line Flags

* `-h` Prints the usage information.
* `-p` Specifies the path to the package.json to update.
* * Example: `-p ../../package.json`
* `-vp` Specifies a version prefix
* * Example: `-vp '~'`
* `-sp` Specifies the number of spaces for indentation (Default: 4)
* * Example `-sp 2`
* `-inc` Specifies to increment the patch version by 1 (ie. 0.0.1)
* * Note: No arguments are required for this.


## Tests

Coming soon...

```bash
npm test
```

_Note_: This requires `mocha`, `should`, `async`, and `underscore`.

To see test coverage, please run:
```bash
npm run coverage
```

## Features

- Upgrades your package.json to have the latest versions for dependencies and devDependencies

## F.A.Q.

Coming soon...