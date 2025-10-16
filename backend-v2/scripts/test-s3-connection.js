const { S3Service } = require('../dist/services/s3.service');
const { config } = require('../dist/config');

async function testS3Connection() {
  console.log('🔍 Testing S3 Configuration...');
  
  // Check configuration
  console.log('📋 S3 Configuration:');
  console.log(`  - Access Key ID: ${config.aws.accessKeyId ? '✅ Set' : '❌ Missing'}`);
  console.log(`  - Secret Access Key: ${config.aws.secretAccessKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`  - Region: ${config.aws.region || '❌ Missing'}`);
  console.log(`  - Bucket Name: ${config.aws.s3BucketName || '❌ Missing'}`);
  
  if (!config.aws.accessKeyId || !config.aws.secretAccessKey || !config.aws.region || !config.aws.s3BucketName) {
    console.log('\n❌ S3 is not properly configured. Please check your .env file.');
    console.log('Required variables:');
    console.log('  - AWS_ACCESS_KEY_ID');
    console.log('  - AWS_SECRET_ACCESS_KEY');
    console.log('  - AWS_REGION');
    console.log('  - S3_BUCKET_NAME');
    return;
  }
  
  try {
    const s3Service = S3Service.getInstance();
    
    // Test if S3 is configured
    const isConfigured = s3Service.isConfigured();
    console.log(`\n🔧 S3 Service Configuration: ${isConfigured ? '✅ Configured' : '❌ Not Configured'}`);
    
    if (!isConfigured) {
      console.log('❌ S3 service is not properly configured.');
      return;
    }
    
    // Test upload a small file
    console.log('\n📤 Testing file upload...');
    const testContent = 'This is a test file for S3 connection';
    const testKey = `test/connection-test-${Date.now()}.txt`;
    
    const uploadResult = await s3Service.uploadFile(
      Buffer.from(testContent),
      testKey,
      {
        contentType: 'text/plain',
        isPublic: false
      }
    );
    
    console.log('✅ File uploaded successfully!');
    console.log(`  - Key: ${uploadResult.key}`);
    console.log(`  - Bucket: ${uploadResult.bucket}`);
    
    // Test signed URL generation
    console.log('\n🔗 Testing signed URL generation...');
    const signedUrl = await s3Service.getSignedUrl(testKey, 3600);
    console.log('✅ Signed URL generated successfully!');
    console.log(`  - URL: ${signedUrl.substring(0, 100)}...`);
    
    // Clean up test file
    console.log('\n🧹 Cleaning up test file...');
    await s3Service.deleteFile(testKey);
    console.log('✅ Test file deleted successfully!');
    
    console.log('\n🎉 S3 connection test completed successfully!');
    console.log('✅ S3 is properly configured and working.');
    
  } catch (error) {
    console.error('\n❌ S3 connection test failed:');
    console.error(`  - Error: ${error.message}`);
    console.error(`  - Code: ${error.code || 'Unknown'}`);
    
    if (error.code === 'CredentialsError') {
      console.log('\n💡 Possible solutions:');
      console.log('  1. Check your AWS credentials in .env file');
      console.log('  2. Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are correct');
      console.log('  3. Make sure your AWS user has S3 permissions');
    } else if (error.code === 'NoSuchBucket') {
      console.log('\n💡 Possible solutions:');
      console.log('  1. Check S3_BUCKET_NAME in .env file');
      console.log('  2. Make sure the bucket exists in the specified region');
      console.log('  3. Verify your AWS user has access to this bucket');
    } else if (error.code === 'InvalidAccessKeyId') {
      console.log('\n💡 Possible solutions:');
      console.log('  1. Check AWS_ACCESS_KEY_ID in .env file');
      console.log('  2. Make sure the access key is valid and active');
    }
  }
}

// Run the test
testS3Connection().catch(console.error);
