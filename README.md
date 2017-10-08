# APM - automated projects manipulator

## Usage

Create `.apmconfig` file in root of folder that contains all projects and describe projects structure.


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

Also you can specify your own scripts in `.apmonfig` `scripts` section.


### `.apmconfig` example

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

Specify reporter for script execution results. Currently only `simple` available.

*-c, --config*

Specify `.apmconfig` file path. Current dirrectory by default.


### Usage examples

```
apm repo status
```

```
apm -t client npm installDev mocha@2.3.0
```

```
apm -t "git & innerApi" run "echo 'node_modules' > .gitignore"
apm -t "git & innerApi" run "git add .gitignore" "git commit -m 'add .gitignore'"
```
