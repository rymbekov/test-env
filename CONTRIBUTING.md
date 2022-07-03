# Pics.io Git Commit Message Conventions

> Based on [AngularJS Git Commit Message Conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y)

## Goals
- allow generating CHANGELOG.md by script
- provide better information when browsing the history

## Format of the commit message
`<type>(<scope>): <subject>`

### __type__
Describes the `type` of change that this commit is providing. Possible values:
- __feat__ (feature)
- __fix__ (bug fix)
- __docs__ (documentation)
- __style__ (formatting, missing semi colons, …)
- __refactor__
- __test__ (when adding missing tests)


### __scope__ (optional)
`scope` can be anything specifying place (component) of the commit change. For example:  
• `fix(detailsPanel): ...`  
• `refactor(keywordsTree): ...`  
• `refactor(keywords): ...`  
• `refactor(*): migrate to ES6 import`  

### __subject__
This is a very short description of the change.
- use imperative, present tense: “change” not “changed” nor “changes”  
- don't capitalize first letter  
-  no dot (.) at the end  

## Examples
- `feat(3DViewer): add scene rendering`  
- `fix(search): change counters color`  
- `fix(videoViewer): stop autoplay by default`  
- `refactor(lightboards): access db via picsio-db package`  
- `style(dam-for-education): use ES6 imports and async/await`  

## Install
1. Install git `commitzen` util and Pics.io commit convention adapter globally: `npm install -g commitizen TopTechPhoto/cz-conventional-changelog`  
2. Specify `commitzen` adapter path in config: `echo '{ "path": "'$(npm root -g)'/cz-conventional-changelog" }' > ~/.czrc`  
4. Use `git cz` command instead of `git commit`. All options supported.

## Further reading
https://robots.thoughtbot.com/better-commit-messages-with-a-gitmessage-template
https://jaketrent.com/post/enforce-git-commit-message-format/
https://github.com/commitizen/cz-cli
http://marionebl.github.io/commitlint/#/guides-local-setup?id=install-husky  
https://www.drupal.org/project/drupal/issues/2802947
