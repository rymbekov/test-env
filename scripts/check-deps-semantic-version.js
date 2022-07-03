const packageData = require('../package.json');
const { dependencies } = packageData;
const pattern = new RegExp("^[0-9]+\.[0-9]+\.[0-9]+$|^[0-9]+\.x+$");

function matchRegex(string) {
  return pattern.test(string);
}

function matchRelease(dependencies = {}) {
  return Object.values(dependencies).every(matchRegex);
}

if (!matchRelease(dependencies)) {
  console.log('!!!WARN: Update your package.json before merging, pre-release version or tilde (~) and caret (^) detected: ',
    Object.keys(dependencies)
      .filter(key => !matchRegex(dependencies[key]))
      .reduce((obj, key) => {
        return { ...obj, [key]: dependencies[key] };
      }, {})
  );
  process.exit(1);
}
