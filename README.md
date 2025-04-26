# TM Runner

[![Version](https://vsmarketplacebadges.dev/version/hieunc229.tm-runner.svg?&colorB=orange)](https://marketplace.visualstudio.com/items?itemName=hieunc229.tm-runner) [![Installs](https://vsmarketplacebadges.dev/installs/hieunc229.tm-runner.svg)](https://marketplace.visualstudio.com/items?itemName=hieunc229.tm-runner) [![Downloads](https://vsmarketplacebadges.dev/downloads/hieunc229.tm-runner.svg)](https://marketplace.visualstudio.com/items?itemName=hieunc229.tm-runner) [![Rating Short](https://vsmarketplacebadges.dev/rating-short/hieunc229.tm-runner.svg)](https://marketplace.visualstudio.com/items?itemName=hieunc229.tm-runner) [![Rating Star](https://vsmarketplacebadges.dev/rating-star/hieunc229.tm-runner.svg)](https://marketplace.visualstudio.com/items?itemName=hieunc229.tm-runner)

Run commands inside Markdown .md or .tm files. This extension comes in handy when you often need to run commands on Terminal

**Please run commands responsibly, I will not responsible for any issue caused by this extension**. Make sure the command is safe

## How to use

This extension add a "Run" button into supported files, which will execute the line instead of copy and paste into Terminal

- **with .md**: With any line that start with "$ ", it'll add a `Run` button above
- **with .tm**: It'll add "Run" button into all lines, accept lines that start with "# "

Note: Besides, there is a "Run All Commands" added into the Right Click menu. When select multiple lines, this option will run all commands line by line

## Development

To install and run it on your machine for development:

1. Download this repository and install dependencies using the following commands:
```sh
$ yarn
```
2. On `Run and Debug (Shift + Cmd + D)`, click on `Run Extension`

## Other

- **Build**
```sh
$ vsce package --no-yarn y
```

- **Publish**
```sh
$ vsce publish
```