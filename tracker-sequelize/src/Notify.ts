'use_strict';

import { TwilioNotify } from "./TwilioNotify";
import { scheduledJobs, scheduleJob } from 'node-schedule';
import logger from '@shared/Logger';
import { AccessKey, UserNotification, User } from "@models/.";
import { TypesOfNotification } from "@models/usernotifications";

export class Notify {
  private twilio!: TwilioNotify;

  constructor() {
    // Initialize twilio
    this.initTwilio();
  }

  /**
   * Default method to run
   */
  public startCronJobs() {
    // Start jobs
    this.initCronJobs();
  }

  /**
   * Send all text messages to users
   */
  public async sendTextMessages(user: User) {
    logger.info("Trigger sendTextMessages");

    const newSurvey = await user.generateSurvey();
    if (newSurvey) {
        logger.info(`Sending text message to ${user.displayName}`);
        const [accessKey] = await AccessKey.generateForSurvey(newSurvey.id);
        const surveyDisplayDate: string = newSurvey.surveyDate.toLocaleDateString('en-US', {
            weekday: 'long',
            //year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const siteName = process.env.SITE_NAME || 'Activity Tracker';
        await this.twilio.sendTextMessage(
            user.mobilePhone,
            `Hi ${user.displayName}, ` +
            `please fill out the ${siteName} survey for ${surveyDisplayDate}: ` +
            `${ accessKey.getUrl() }`);
    }
    else {
        logger.err(`There was an issue sending a text message to ${user.displayName}`);
    }
  }

  /**
   * Send emails to all users
   */
  public sendEmailMessages(user: User) {
    logger.info("Trigger sendEmailMessages");
    return;

    if (user.email.length > 0) {
        logger.info(`Send email message to ${user.displayName}`);
        // await this.twilio.sendTextMessage(
        //   user.mobilePhone, `Hi ${user.displayName}, Please fill out the survey at ...`);
    }
  }

  /**
   * Initialize Twilio with environment variables
   */
  private initTwilio() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

    // Initialize twilio notification
    if (accountSid && authToken && twilioNumber) {
        this.twilio = new TwilioNotify(accountSid, authToken, twilioNumber);
    }
    else {
        logger.info(
            "Twilio environment variables (account sid, auth token, and phone number not set");
    }
  }

  /**
   * Create cron job
   *
   * Order of asterisk:
   * - Seconds: 0-59
   * - Minutes: 0-59
   * - Hours: 0-23
   * - Day of Month: 1-31
   * - Months: 0-11 (Jan-Dec)
   * - Day of Week: 0-6 (Sun-Sat)
   *
   * See: https://www.npmjs.com/package/cron#cron-ranges
   * See: https://www.npmjs.com/package/cron#available-cron-patterns
   */
  private async initCronJobs() {
    const notifications = await UserNotification.findAll({
      attributes: ['daysToSend', 'timeToSend', 'typeOfNotification', 'id', 'userId'],
      include: {
          model: User,
          as: 'user',
      }
    });

    await Promise.all(notifications.map((notification: UserNotification) => {
      // @TODO change cron time to be based off user/category
      // scheduleJob('30 5 19 * * 1', () => { // Send notification at 19:05, Mon
      this.scheduleCronJob(notification);
    }));

  }

  public static getScheduleJobId(notificationId: number) {
    return `notifications.id-${notificationId}`;
  }

  public scheduleCronJob(notification: UserNotification, user = notification.user) {

    const [hr, min, sec] = notification.timeToSend.split(':');
    const days = notification.daysToSend;

    logger.info(`Schedule job: "${sec} ${min} ${hr} * * ${days}" for` +
      ` notif #${notification.id}, user #${notification.userId}`);

    // logger.info(`User object of notification ${JSON.stringify(user)}`)

    scheduleJob(
        Notify.getScheduleJobId(notification.id),
        {
          tz: process.env.SCHEDULE_TIMEZONE,
          rule: `${sec} ${min} ${hr} * * ${days}`
        },
        () => {
          try {
            if (user) {
              switch (notification.typeOfNotification) {
                case TypesOfNotification.Text:
                  this.sendTextMessages(user);
                  break;

                // case TypesOfNotification.Email:
                //   this.sendEmailMessages(user);
                //   break;

                // case TypesOfNotification.TextAndEmail:
                //   this.sendTextMessages(user);
                //   this.sendEmailMessages(user);
                //   break;
              }
            }
          } catch (e) {
            logger.err(e);
          }
      });
  }

  public static updateScheduledJob(notification: UserNotification, user = notification.user) {
    // If scheduled job already exists, cancel and recreate it
    if (scheduledJobs[Notify.getScheduleJobId(notification.id)]) {
      scheduledJobs[Notify.getScheduleJobId(notification.id)].cancel();
    }

    const notify = new Notify();
    notify.scheduleCronJob(notification, user);
  }
}
