#!/usr/bin/env node

require('../dist/cmd.js')
  .createBunCmdShortcut('prettier')()
  .catch((err) => {
    console.log(err)
  })
