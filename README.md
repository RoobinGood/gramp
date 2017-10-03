# APM - automated projects manipulator

## `.apmconfig` example

```javascript
{
	"projects": [
		{
			"name": "project-1",
			"repository": {
				"path": "./project-1",
				"type": "hg"
			}
		},
		{
			"name": "project-2",
			"repository": {
				"path": "./project-2",
				"type": "git"
			}
		}
	],
	"scripts": [
		{
			"name": "checkout",
			"path": "apm/scripts/checkout"
		},
		{
			"name": "dependency",
			"path": "apm/scripts/dependency"
		}
	]
}
```
