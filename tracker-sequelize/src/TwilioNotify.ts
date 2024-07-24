import { Twilio } from "twilio";
// import { ConnectionPolicyInstance } from "twilio/lib/rest/voice/v1/connectionPolicy";
import logger from '@shared/Logger';

export class TwilioNotify {
  private accountSid!: string;
  private authToken!: string;
  private twilioNumber!: string;
  private twilioClient!: Twilio;

  constructor(accountSid : string, authToken: string, twilioNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;

    try {
      this.twilioNumber = TwilioNotify.formatTwilioNumer(twilioNumber);
    }
    catch (e) {
      logger.err(e);
      throw new Error("There was an problem initializing Twilio.");
    }

    this.twilioClient = new Twilio(this.accountSid, this.authToken);
  }

  public async sendTextMessage(mobileNumber: string, message: string) {
    // Format the number
    mobileNumber = TwilioNotify.formatTwilioNumer(mobileNumber);

    try {
      const twilioMessage = await this.twilioClient.messages.create({
        from: this.twilioNumber,
        to: mobileNumber,
        body: message,
      });

      logger.info(twilioMessage.sid);
    }
    catch (e) {
      logger.err(e);
    }
  }

  public static formatTwilioNumer(userPhoneString: string) {
    let phoneString = userPhoneString.replace(/\D/g, '');

    if (phoneString.length === 10) {
      phoneString = '1' + phoneString;
    }
    if (phoneString.length !== 11) {
      throw new Error(`The phone number "${userPhoneString}" is not valid.`);
    }
    return '+' + phoneString;
  }
}
