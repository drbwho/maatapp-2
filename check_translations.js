const fs = require('fs');
const path = require('path');

// Function to flatten nested object keys
function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys = keys.concat(flattenKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  return keys;
}

// Load en.json
const enPath = path.join(__dirname, 'src/assets/i18n/en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enKeys = flattenKeys(enData);

// Languages to check
const langs = ['zh'];

langs.forEach(lang => {
  const langPath = path.join(__dirname, `src/assets/i18n/${lang}.json`);
  const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  const langKeys = flattenKeys(langData);

  const missingKeys = enKeys.filter(key => !langKeys.includes(key));
  const extraKeys = langKeys.filter(key => !enKeys.includes(key));

  console.log(`\n=== ${lang.toUpperCase()} ===`);
  if (missingKeys.length === 0) {
    console.log('Complete: All keys from en.json are present.');
  } else {
    console.log('Missing keys:');
    missingKeys.forEach(key => console.log(`  - ${key}`));
  }
  if (extraKeys.length > 0) {
    console.log('Extra keys:');
    extraKeys.forEach(key => console.log(`  + ${key}`));
  }
});