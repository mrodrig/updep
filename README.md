# updep

[![Dependencies](https://img.shields.io/david/mrodrig/updep.svg?style=flat-square)](https://www.npmjs.org/package/updep)
[![Downloads](http://img.shields.io/npm/dm/updep.svg)](https://www.npmjs.org/package/updep)
[![NPM version](https://img.shields.io/npm/v/updep.svg)](https://www.npmjs.org/package/updep)
[![Known Vulnerabilities](https://snyk.io/test/npm/updep/badge.svg)](https://snyk.io/test/npm/updep)
[![Build Status](https://travis-ci.org/mrodrig/updep.svg?branch=master)](https://travis-ci.org/mrodrig/updep)

Automatically upgrade your NPM dependencies to the latest version!

This module provides the CLI functionality that you've been looking for to
tackle technical debt with NPM modules head-on. You'll be up-to-date in no time 
with the functionality to specify the upgrade level to run or you can perform a
dry-run to see what upgrades would be made without actually changing anything.

## Installation

```bash
$ npm install -g updep
```

## Upgrading
```bash
$ npm update -g updep
```

## Usage

```
Usage: updep <package.json> [options]

Options:
  -v, --version                     output the version number
  -p, --version-prefix <prefix>     Optional package version prefix to prepend (default: "^")
  -s, --indent-spaces <num_spaces>  Number of spaces of indentation for package.json (default: 4)
  -i, --version-increment [level]   Version increment level (default: "patch")
  -V, --verbose                     Verbose mode
  -U, --upgrade-level [level]       Dependency version upgrade level (default: "major")
  -D, --dry-run                     Show the upgrades that would be performed instead of upgrading
  -h, --help                        output usage information

Examples:
  $ updep --help
  $ updep -h
  $ updep package.json -p ^ -i major
  $ updep package.json -p "~" -s 4 -i minor -U patch --dry-run
```


## Tests

Coming soon...

```bash
npm run lint && npm test
```

_Note_: This requires `mocha` and `should`.

## Features

- Upgrades your package.json to have the latest versions for dependencies and devDependencies.
