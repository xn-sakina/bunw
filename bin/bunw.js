#!/usr/bin/env node

require('../dist/cmd.js')
  .createBunCmdShortcut()()
  .catch((err) => {
    console.log(err)
  })
