# Advanced REST Client CLI tools

See https://github.com/advanced-rest-client/arc-dev-guide for more information about developing Advanced REST Client modules.

`arc-tools` is a set of ARC CLI commands to help developing and maintaining web components.

## Commands
| Command | Description |
| --- | --- |
| `release <target>` | Builds the app for given <release>, update git repository and publish the app in the Chrome Web Store |
| `arc clone <component> [otherComponents...]` | Clones or pulls advanced-rest-client's repositories into the current folder |
| `docs <component> [otherComponents...]` | Generates docs for given components |
| `structure [component] [otherComponents...]` | Updates structure database for the elements catalog |
| `bump <version>` | Bumps version of the element |
| `changelog` | Generates changelog for current element |
| `repo <command>` | Performs an operation on ARC GitHub's repository |
| `stage <component>` | CI command. Builds element from stage branch |
| `master-release` | CI command. Releases element from master branch |

### arc release
Builds the app for given target and (optionally) creates a release and publish the app in the Chrome Web Store.

#### Usage
```
arc release [options] <target>
```

The `<target>` argument must be one of the:
* stable
* beta
* dev
* canary

#### Options
| Option | Description |
| --- | --- |
| `-h`, `--hotfix` | This is a hotfix release (only patch version change) |
| `-b`, `--build-only` | Only build the package and do nothing else |
| `-p`, `--publish` | Publish the package after successful build |
| `-c`, `--credentials [path]` | Path to the credentials file. Defaults to ./.credentials.json. See below for more information. |
| `-t`, `--token` | Github access token. If not present the GITHUB_TOKEN variable will be used instead. If it's not set the command will fail to publish the release. [Read more about GitHub tokens.](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) |
| `--verbose` | Print detailed error messages. |
| `-h`, `--help` | Output usage information |
| `-V`, `--version` | Output the version number |

#### Example
```bash
arc release canary --publish
arc release beta --hotfix --publish
arc release stable --hotfix --build-only
```

#### .credentials.json
Example of the credentials file is included into ChromeRestClient respository.
Structure of the file is following:
```json
{
  "web": {
    "clientId": "[GOOGLE CONSOLE CLIENT ID]",
    "projectId": "[GOOGLE CONSOLE PROJECT NAME (ID)]",
    "authUri": "https://accounts.google.com/o/oauth2/auth",
    "tokenUri": "https://accounts.google.com/o/oauth2/token",
    "authProvider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "clientSecret": "[CWS API CLIENT SECRET]",
    "redirectUris": [
      "http://localhost:8080/callback"
    ]
  }
}
```
It contains data available in Google Developer Console after creating a project.
Content of the real file is not public since it contains sensitive information.

### arc clone
Clones selected or all components from the [advanced-rest-client](https://github.com/advanced-rest-client) repository. If the element is already located in current folder it will pull changes from `stage` branch.

This command must not be executed from components directory but it's parent.

#### Usage
```
arc clone [options] [components...]
```
#### Options
| Option | Description |
| --- | --- |
| `-S, --no-ssh` | Force `http` git path instead of `ssh`. It is a good idea for developers who don't have an access to the repository. |
| `-A, --all` | Clone all repositories (then don't set list of components to clone) |
| `-n, --no-deps` | Do not download dependencies for the element (npm and bower) |
| `--verbose` | Display log messages |
| `-h, --help` | Output usage information |

#### Example
```bash
arc clone --all
arc clone --no-ssh arc-database arc-tools
```
### arc docs
Generates README.md for given components. The content if the file will be taken
form component's file. Read more about [documenting your elements](https://www.polymer-project.org/1.0/docs/tools/documentation).

Note that documentation requires proper tagging for the element to be included into the [ARC element catalog](https://elements.advancedrestclient.com/). More info in the `structure` command.

#### Usage
```
arc docs [options] [components...]
```
`components` is optional. If omnited and `--all` option is not set then it will generate the docs for the component in current directory.
If the `main` entry in the bower.json file is an array of elements then it will generate documentation for all files included into the `main` property.
The docuemntation will be generated in single file.

#### Options
| Option | Description |
| --- | --- |
| `-A, --all` | Generate docs for all components |
| `--verbose` | Display messages |
| `-h, --help` | Output usage information |

Don't use `--all` and list components if you want to generate doc in current directory.

#### Example
```bash
arc docs --all # must be in components main directory
arc docs raml-js-parser file-drop # must be in components main directory
arc docs # must be in component's directory
```

### arc structure
Updates [ARC elements catalog](https://elements.advancedrestclient.com/) structure.

Elements are groupped into few groups:
* UI elements
* Logic elements
* Chrome elements
* RAML elements
* Transport elements

Each new custom element that is part of the ARC project should be included into this structure and therefore well documented.
This system uses tags included into the element documentation. This tags instruct the system where to put this element.

Example:
```
@group Logic Elements
@element arc-database
@demo demo/index.html Requests datastore
```
Tags above are part of arc-datastore component and it instructs the catalog to put this element under Logic Elements group.

Command will read the structure information of current element and update dependency if the parent element if needed. If the `--release` option is set then parent element will be published as a new release so the catalog will load new version.

#### Usage
```
arc structure [options] [components...]
```

The `components` parameter is optional and it must be replaced with `--all`.

#### Options
| Option | Description |
| --- | --- |
| `-A, --all` | Update structure database for all components. This command must be called from the main directory (parent of the element). |
| `-r, --release` | Make structure elements release after updating their dependencies. If the component was already in it's dependecies it will do nothing. |
| `--verbose` | Display messages |
| `-h, --help` | Output usage information |

#### Example
```bash
arc structure --all # must be in components main directory
arc structure raml-js-parser file-drop # must be in element directory
arc structure # must be in element directory
```
### arc bump
Bumps version of the element. It doesn't generate new version number. It must be passed as an argument.
**This command is used on the CI server.**

#### Usage
```
arc bump [options] <version>
```

#### Options
| Option | Description |
| --- | --- |
| `-h, --help` | Output usage information |

#### Example
```bash
arc bump 1.0.1
```
### arc changelog
Creates a CHANGELOG.md file from git commits. Commits must follow [this template](https://github.com/conventional-changelog/conventional-changelog-eslint/blob/master/convention.md).

**This command is used on the CI server.**

#### Usage
```
arc changelog
```

### arc repo
Perform an operation on a GitHub repository.
You must have access to the `advanced-rest-client` organization to use this command.

#### Usage
```
arc repo [options] <command> [repo-name]
```
Currently only `create` command is supported. It creates a repository in ARC's ogranization with default configuration.

If the command is run in the component directory it will get all the information from the bower.json file (repo name and description). In this case passing any argument is redundant.

This command is interactive. If there's more than one team in the organization then it will ask for a team to give access to the repo.
At the end it will ask if initialize repo in current directory. If yes it will create `master` and `stage` branches for this repo (locally and on remote).

#### Options
| Option | Description |
| --- | --- |
| `--token` | Github access token. If not present the GITHUB_TOKEN variable will be used instead. If it's not set the command will fail to create the repository. [Read more about GitHub tokens.](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) |
| -D, --description | Description of the repository |
| `--verbose` | Print output to console. |
| `-h, --help` | Output usage information |

#### Example
```bash
arc repo create -d "Test repo" repo-name
arc repo create # In the component folder.
```
### arc stage
**This is a CI command.**

Builds the component from the `stage` branch.

#### Usage
```
arc stage [options] <component>
```
#### Options
| Option | Description |
| --- | --- |
| `--working-dir <dir>` | Make build in this directory. |
| `--verbose` | Display messages |
| `-h, --help` | Output usage information |

### arc master-release
**This is a CI command.**

Make a release from the `master` branch.

#### Usage
```
arc master-release
```
