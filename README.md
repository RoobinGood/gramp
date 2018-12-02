# gramp - repositories group automated manipulator

## Usage

Create `.gramprc` file in root of folder that contains all projects and describe projects structure.


### Scripts

You can run some commands, such as:

* npm - work with project package or dependencies
	* showVersion
	* install
	* installDev
	* update
	* uninstall
* repo - work with hg or git repositories
	* status
	* checkout
* run - execute shell commands

Also you can specify your own scripts in `.gramprc` `scripts` section.


### `.gramprc` example

```javascript
{
	"projects": [
		{
			"name": "project-a",
			"tags": [
				"hg", "client"
			],
			"repository": {
				"path": "./project-a",
				"type": "hg"
			}
		},
		{
			"name": "project-b",
			"tags": [
				"git", "client"
			],
			"repository": {
				"path": "./project-b",
				"type": "git"
			}
		},
		{
			"name": "project-c",
			"tags": [
				"git", "backend"
			],
			"repository": {
				"path": "./project-c",
				"type": "git"
			}
		}
	],
	"scripts": [
		{
			"name": "test",
			"path": "./flow/scripts/"
		}
	]
}
```


### Options

*-p, --projects*

Comma separated list of projects.

*-t, --tag*

Boolean expression to filter projects by tags.

*-r, --reporter*

Specify reporter for script execution results. Available reporters: `json`, `simple` (by default).

*-c, --config*

Specify `.gramprc` file path. Current dirrectory by default.

*-n, --concurrency*

Specify number of concurrent execution threads. 3 by default.

### Usage examples

```
gramp repo status
```

```
gramp -t client npm installDev mocha@2.3.0
```

```
gramp -t "git & backend" run "echo 'node_modules' > .gitignore"
gramp -t "git & backend" run "git add .gitignore" "git commit -m 'add .gitignore'"
```
