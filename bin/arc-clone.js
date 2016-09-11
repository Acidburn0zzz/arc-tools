#!/usr/bin/env node

'use strict';

process.title = 'arc-clone';

const clone = require('../lib/arc-clone');
const script = new clone.ArcClone();
script.run();
