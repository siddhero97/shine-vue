import StatusCodes from 'http-status-codes';
import { Request, Response, Router } from 'express';
import {
    SurveySubmission, Survey
} from '@models/index';
import logger from '@shared/Logger';
import Sequelize from 'sequelize';
const router = Router();

const { BAD_REQUEST, CREATED, OK } = StatusCodes;

router.get('/survey-status', async (req: Request, res: Response) => {
    // Get the count of all surveys 
    //  const surveyCount = await Survey.count();
    // Get the count of all survey submissions with status 2
    const surveySubmissionCount =  await Survey.count({
        where: {
            status: 2
        }
    });
    // Get the count of all surveys without submissions
    const surveyWithoutSubmissionCount =  await Survey.count({
        where: {
            status: 1
        }
    });
    const surveyCount = surveySubmissionCount + surveyWithoutSubmissionCount;
    return res.status(OK).json({surveyCount, surveySubmissionCount,  surveyWithoutSubmissionCount });
});


router.get('/active-users', async (req: Request, res: Response) => {
    // Find all survey group by status and userId
    // console.log(activeUsers);
    const surveys = await Survey.findAll({
        attributes: ['userId', 'createdAt'],
        where: {
            status: 2
        }
    });

    // Function to group surveys by a specific time unit
    function groupByTimeUnit(surveys: any[], unit: string) {
        return surveys.reduce((groups: any[], survey: any) => {
            let timeKey;
            switch (unit) {
                case 'daily':
                    timeKey = survey.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
                    break;
                // case 'weekly':
                //     const startOfWeek = Sequelize.fn('DATE_FORMAT', Sequelize.col('createdAt'), '%Y-%u');
                //     timeKey = startOfWeek;
                //     console.log("weekly timeKey", timeKey, "group", groups, "survey", survey);
                //     break;
                case 'monthly':
                    timeKey = survey.createdAt.toISOString().slice(0, 7); // YYYY-MM
                    break;
                default:
                    throw new Error('Invalid time unit');
            }

            if (!groups[timeKey]) {
                groups[timeKey] = [];
            }
            groups[timeKey].push(survey);
            return groups;
        }, {});
    }

    // Group the surveys by day, week, and month
    const surveysGroupedDaily = groupByTimeUnit(surveys, 'daily');
    // const surveysGroupedWeekly = groupByTimeUnit(surveys, 'weekly');
    const surveysGroupedMonthly = groupByTimeUnit(surveys, 'monthly');
    return res.status(OK).json({surveysGroupedDaily, 
        // surveysGroupedWeekly, 
        surveysGroupedMonthly});


});
export default router;