import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import AccessKeyTransientPage from '../views/AccessKeyTransientPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'HomePage',
    component: HomePage,
    props: {
      isSurveyDone: false
    }
  },
  {
    path: '/thanks',
    name: 'ThanksHomePage',
    component: HomePage,
    props: {
      isSurveyDone: true
    }
  },
  {
    path: '/accesskey/:accessKey',
    name: 'AccessKeyTransientPage',
    component: AccessKeyTransientPage
  },
  {
    path: '/survey/:surveyId',
    name: 'SurveyPage',
    component: () => import('@/views/SurveyPage.vue')
  },
  {
    path: '/summary/:surveyId',
    name: 'SummaryPage',
    component: () => import('@/views/SummaryPage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFoundPage',
    component: () => import('@/views/NotFoundPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
