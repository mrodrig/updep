# Automatically upgrade your NPM dependencies to the latest version!

[![Dependencies](https://img.shields.io/david/mrodrig/updep.svg?style=flat-square)](https://www.npmjs.org/package/updep)
[![Downloads](http://img.shields.io/npm/dm/updep.svg)](https://www.npmjs.org/package/updep)
[![NPM version](https://img.shields.io/npm/v/updep.svg)](https://www.npmjs.org/package/updep)
[![Known Vulnerabilities](https://snyk.io/test/npm/updep/badge.svg)](https://snyk.io/test/npm/updep)
[![Build Status](https://travis-ci.org/mrodrig/updep.svg?branch=master)](https://travis-ci.org/mrodrig/updep)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=rodrigues.mi%40husky.neu.edu&item_name=Open+Source+Software+Development+-+Node+Modules&currency_code=USD&source=url)

This node module will convert an array of JSON documents to a CSV string.
Column headings will be automatically generated based on the keys of the JSON documents. Nested documents will have a '.' appended between the keys.

It is also capable of converting CSV of the same form back into the original array of JSON documents.
The columns headings will be used as the JSON document keys.  All lines must have the same exact number of CSV values.

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
  -h, --help                        output usage information

Examples:
  $ updep --help
  $ updep -h
  $ updep package.json -p ^ -i minor
  $ updep package.json -p "~" -s 4 -i major
```


## Tests

Coming soon...

```bash
npm run lint && npm test
```

_Note_: This requires `mocha` and `should`.

## Features

- Upgrades your package.json to have the latest versions for dependencies and devDependencies.
