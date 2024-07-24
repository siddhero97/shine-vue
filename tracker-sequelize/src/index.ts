import './pre-start'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';

// For notifications
import { Notify } from './Notify'
// import SurveyWrapper from './modelWrappers/surveyWrapper';
import { scheduledJobs } from 'node-schedule';


// Start the server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
    logger.info('Express server started on port: ' + port);
});

/**
 * Create cronjob for notifying users
 */
if (process.env.TWILIO_DISABLE_NOTIFICATIONS === 'false') {
    const notify = new Notify();
    notify.startCronJobs();

    // setTimeout(() => {
    //     scheduledJobs['default.cron.job'].cancel();
    //     logger.info('Canceled default.cron.job after 15s');
    // }, 15000);   
}