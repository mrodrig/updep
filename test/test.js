'use strict';

const { join } = require('path'),
    utilities = require('./utilities');

describe('updep', () => {
    const snapshotsPath = join(__dirname, './snapshots'),
        snapshots = utilities.getDirectories(snapshotsPath);

    snapshots.forEach((snapshotDir) => {

        describe(snapshotDir.name, () => {
            it('works!', (done) => done());
        });

    });
});
