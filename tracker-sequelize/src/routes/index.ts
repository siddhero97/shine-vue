import { Router } from 'express';
import UserRouter from './Users';
import SurveyAccessRouter from './SurveyAccess';
import SurveyRouter from './Surveys';
import SurveyMetadataRouter from './SurveyMetadata';
import SurveySubmissionRouter from './SurveySubmissions';
import QuestionsRouter from './Questions'
import CategoriesRouter from './Categories'
import { authenticateToken, requireAdminAccess, requireSurveyAccess } from '@shared/functions';
import SessionRouter from './SessionRouter';
import ChartRouter from './ChartRouter';
// Init router and path
const router = Router();

// Routes that do not require authentication
router.use('/surveyaccess', SurveyAccessRouter);
// TODO: write router for login/logut session management.
router.use('/session', SessionRouter);
router.use('/charts', 
    // requireAdminAccess, 
    ChartRouter);


// All routers below this line require an authentication token.
router.use('*', authenticateToken);

// Add sub-routes for surveys
router.use('/surveymetadata', requireSurveyAccess, SurveyMetadataRouter);
router.use('/surveysubmissions', requireSurveyAccess, SurveySubmissionRouter);

// Add sub-routes for admin interface
router.use('/users', requireAdminAccess, UserRouter);
router.use('/surveys', requireAdminAccess, SurveyRouter);
router.use('/questions', requireAdminAccess, QuestionsRouter);
router.use('/categories', requireAdminAccess, CategoriesRouter);

// Export the base-router
export default router;
