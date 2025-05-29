const twilio = require('twilio');

// Initialize Twilio client with environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Check if Twilio configuration is valid
const isValidAccountSid = accountSid && accountSid.startsWith('AC');
const isTwilioConfigured = isValidAccountSid && authToken && twilioPhoneNumber;

// Initialize client if valid configuration exists
const client = isTwilioConfigured ? twilio(accountSid, authToken) : null;

if (isTwilioConfigured) {
  console.log('Twilio client configured successfully');
} else {
  console.log('WARNING: Twilio credentials not configured or invalid. SMS messages will be mocked.');
  if (accountSid && !accountSid.startsWith('AC')) {
    console.log('Error: TWILIO_ACCOUNT_SID must start with "AC"');
  }
}

// Send SMS
exports.sendSMS = async (phoneNumber, message) => {
  try {
    // Check if Twilio is configured
    if (!isTwilioConfigured) {
      console.log(`[MOCK SMS] Sending to: ${phoneNumber}, Message: ${message}`);
      return { success: true, mock: true };
    }
    
    // Send real SMS via Twilio
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber
    });
    
    console.log(`SMS sent successfully to ${phoneNumber}, Message SID: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}; 