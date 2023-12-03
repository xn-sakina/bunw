#!/usr/bin/env node

require('../dist/cmd.js')
  .createBunCmdShortcut('tsc')()
  .catch((err) => {
    console.log(err)
  })
