const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create SSL directory
const sslDir = path.join(__dirname, '../nginx/ssl');
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
}

// Generate self-signed certificate for development
const generateSelfSignedCert = () => {
  console.log('🔐 Generating self-signed SSL certificate for development...');
  
  try {
    // Generate private key
    execSync(`openssl genrsa -out ${sslDir}/key.pem 2048`, { stdio: 'inherit' });
    
    // Generate certificate
    execSync(`openssl req -new -x509 -key ${sslDir}/key.pem -out ${sslDir}/cert.pem -days 365 -subj "/C=AE/ST=Dubai/L=Dubai/O=Roomy/CN=localhost"`, { stdio: 'inherit' });
    
    console.log('✅ Self-signed certificate generated successfully!');
    console.log('📁 Certificate files created in:', sslDir);
    console.log('⚠️  This is for development only. Use proper certificates for production.');
    
  } catch (error) {
    console.error('❌ Error generating self-signed certificate:', error.message);
    console.log('💡 Make sure OpenSSL is installed on your system');
  }
};

// Generate certificate using mkcert (if available)
const generateMkcertCert = () => {
  console.log('🔐 Generating certificate using mkcert...');
  
  try {
    // Install mkcert if not available
    execSync('mkcert -install', { stdio: 'inherit' });
    
    // Generate certificate
    execSync(`mkcert -key-file ${sslDir}/key.pem -cert-file ${sslDir}/cert.pem localhost 127.0.0.1 ::1`, { stdio: 'inherit' });
    
    console.log('✅ mkcert certificate generated successfully!');
    console.log('📁 Certificate files created in:', sslDir);
    
  } catch (error) {
    console.error('❌ Error generating mkcert certificate:', error.message);
    console.log('💡 Falling back to self-signed certificate...');
    generateSelfSignedCert();
  }
};

// Main function
const main = () => {
  console.log('🚀 Starting SSL certificate generation...');
  
  // Try mkcert first, fallback to self-signed
  try {
    execSync('mkcert --version', { stdio: 'pipe' });
    generateMkcertCert();
  } catch (error) {
    console.log('⚠️  mkcert not found, using self-signed certificate...');
    generateSelfSignedCert();
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Update your hosts file to include the domain');
  console.log('2. Configure your frontend to use HTTPS');
  console.log('3. For production, use Let\'s Encrypt or a proper CA');
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateSelfSignedCert,
  generateMkcertCert,
  main,
};
