import 'dotenv/config';

const requiredEnvVars = [
  'VITE_AUTH0_DOMAIN',
  'VITE_AUTH0_CLIENT_ID',
  'VITE_CONTENTFUL_SPACE_ID',
  'VITE_CONTENTFUL_ACCESS_TOKEN',
  'VITE_MONGODB_URI',
  'DATABASE_URL'
];

console.log('Testing environment variables...\n');

const missingVars = [];
const presentVars = [];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  } else {
    presentVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('❌ Missing environment variables:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
} else {
  console.log('✅ All required environment variables are present!');
}

if (presentVars.length > 0) {
  console.log('\n✅ Found environment variables:');
  presentVars.forEach(varName => {
    const value = process.env[varName];
    const maskedValue = value.substring(0, 4) + '...' + value.substring(value.length - 4);
    console.log(`   - ${varName}: ${maskedValue}`);
  });
}

console.log('\nNote: Values are masked for security.'); 