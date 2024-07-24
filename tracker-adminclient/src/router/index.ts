import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import AdminHomePage from '../views/AdminHomePage.vue'
import UserEditPage from '../views/UserEditPage.vue' 
import CategoryEditPage from '../views/CategoryEditPage.vue' 
import QuestionEditPage from '../views/QuestionEditPage.vue' 
import UsersOverview from '../views/UsersOverview.vue' 
import CategoriesOverview from '../views/CategoriesOverview.vue' 
import QuestionsOverview from '../views/QuestionsOverview.vue' 
import LoginPage from "../views/LoginPage.vue";
import { checkAccessTokenNavigationGuard } from './navigationGuards';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/admin'
  },
  {
    path: '/admin',
    name: 'AdminHomePage',
    component: AdminHomePage
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/admin/users/overview',
    name: 'UsersOverview',
    component: UsersOverview,
  },
  {
    // Use entityId intead of userId for getRouteIdFromRoute() of composables/useEntity()
    path: '/admin/users/:entityId',
    name: 'UserEditPage',
    component: UserEditPage
  },
  {
    path: '/admin/users/create',
    name: 'UserCreatePage',
    component: UserEditPage,
    props: {
      entityId: 0 // Use 0 to signifying that we're creating an entity
    },
  },
  {
    path: '/admin/categories/overview',
    name: 'CategoriesOverview',
    component: CategoriesOverview,
  },
  {
    path: '/admin/categories/:entityId',
    name: 'CategoryEditPage',
    component: CategoryEditPage
  },
  {
    path: '/admin/categories/create',
    name: 'CategoryCreatePage',
    component: CategoryEditPage,
    props: {
      entityId: 0
    },
  },
  {
    path: '/admin/questions/overview',
    name: 'QuestionsOverview',
    component: QuestionsOverview,
  },
  {
    path: '/admin/questions/:entityId',
    name: 'QuestionEditPage',
    component: QuestionEditPage
  },
  {
    path: '/admin/questions/create',
    name: 'QuestionCreatePage',
    component: QuestionEditPage,
    props: {
      entityId: 0
    },
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// @TODO Temporary navigation guard. Refactor to userAccess.ts file?
// # Begin temporary navigation guard
router.beforeEach(checkAccessTokenNavigationGuard);
// # End temporary navigation guard

export default router
