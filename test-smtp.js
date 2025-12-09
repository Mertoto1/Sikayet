const nodemailer = require('nodemailer');

// Test SMTP configuration
async function testSMTP() {
  console.log('Testing SMTP configuration...');
  
  // Try to create a transporter with common SMTP settings
  const configs = [
    {
      name: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      // You would need to provide actual credentials here
      auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password'
      }
    },
    {
      name: 'Outlook/Hotmail',
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your-email@outlook.com',
        pass: 'your-password'
      }
    },
    {
      name: 'Yahoo',
      host: 'smtp.mail.yahoo.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your-email@yahoo.com',
        pass: 'your-app-password'
      }
    }
  ];
  
  for (const config of configs) {
    console.log(`\nTesting ${config.name} SMTP...`);
    try {
      const transporter = nodemailer.createTransporter({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
        // Reduced timeouts for testing
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000
      });
      
      // Verify connection
      await transporter.verify();
      console.log(`✅ ${config.name} SMTP connection successful!`);
      return config;
    } catch (error) {
      console.log(`❌ ${config.name} SMTP failed:`, error.message);
    }
  }
  
  console.log('\nNo working SMTP configuration found.');
  console.log('\nTo fix SMTP issues:');
  console.log('1. Go to http://localhost:3000/admin/settings');
  console.log('2. Update SMTP settings with valid credentials');
  console.log('3. Common providers:');
  console.log('   - Gmail: smtp.gmail.com, port 587, TLS');
  console.log('   - Outlook: smtp-mail.outlook.com, port 587, TLS');
  console.log('   - Yahoo: smtp.mail.yahoo.com, port 587, TLS');
  console.log('4. For Gmail, you need an App Password, not your regular password');
}

testSMTP().catch(console.error);