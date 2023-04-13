# sonarqube-export

CLI tool to export data from SonarQube to CSV using WebAPI

- [sonarqube-export](#sonarqube-export)
  - [Installation](#installation)
  - [Setup](#setup)
  - [Usage](#usage)
    - [Export Bugs List](#export-bugs-list)
    - [Export Code Smells List](#export-code-smells-list)
  - [Getting Help](#getting-help)
  - [Support](#support)

## Installation

```sh
git clone https://github.com/ajalilmian/sonarqube-export.git
cd sonarqube-export
npm install
```

## Setup

First of all declare the environment variables in the `.env` file. You can also copy the `.env.example` file to see available variables.

```sh
cp .env.example .env
```

## Usage

### Export Bugs List

Export a CSV file that lists count of bugs by authors.

```sh
node index.js bugs
```

This will create a file `bugs.csv` in the current directory. To specify a custom name for the file to export use the `-f` or `--filename` flag. See [Available Options](#available-options) below for more details.

#### Available Options

```console
-p, --project <projects...>     only list bugs for specified project
-a, --author <authors...>       only show specified authors
-s, --severity <severities...>  only list bugs of specified severity (choices: "INFO", "MINOR", "MAJOR", "CRITICAL", "BLOCKER")
-f, --filename <name>           name of CSV file (default: "bugs.csv")
-h, --help                      display help for command
```

### Export Code Smells List

Export a CSV file that lists count of code smells by authors.

```sh
node index.js smells
```

This will create a file `smells.csv` in the current directory. To specify a custom name for the file to export use the `-f` or `--filename` flag. See [Available Options](#available-options) below for more details.

#### Available Options

```console
-p, --project <projects...>     only list code-smells for specified project
-a, --author <authors...>       only show specified authors
-s, --severity <severities...>  only list code-smells of specified severity (choices: "INFO", "MINOR", "MAJOR", "CRITICAL", "BLOCKER")
-f, --filename <name>           name of CSV file (default: "smells.csv")
-h, --help                      display help for command
```

## Getting Help

Use the `help [command]` to display help for the specified command.

```sh
node index.js help bugs
```

```console
Usage: sonarqube-export bugs [options]

Export a CSV file that lists count of bugs by authors

Options:
  -p, --project <projects...>     only list bugs for specified project
  -a, --author <authors...>       only show specified authors
  -s, --severity <severities...>  only list bugs of specified severity (choices: "INFO", "MINOR", "MAJOR", "CRITICAL", "BLOCKER")
  -f, --filename <name>           name of CSV file (default: "bugs.csv")
  -h, --help                      display help for command
```

## Support

The current version of sonarqube-export is fully supported on long term support versions of Node.js and requires at least v14.

The main forum for support is the project [Issues](https://github.com/ajalilmian/sonarqube-export/issues) on GitHub.
