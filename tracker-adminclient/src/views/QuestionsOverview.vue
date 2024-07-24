<template>
  <ion-page>
    <adm-header>
      <adm-authenticated-nav
        :goToAsync="goToAsync"
        :logoutAsync="logoutAsync"
        :goToLoggedInUserEditPage="goToLoggedInUserEditPage">
      </adm-authenticated-nav>
    </adm-header>

    <ion-content>
      <div id="container" style="text-align: left">
        <ion-button @click="createQuestion()" style="float: right">+ Create Questions</ion-button>
        <ion-title size="medium">Questions</ion-title>
        <ion-grid  style="margin-top: 2em;">
          <ion-row style="font-weight: bold" class='ion-align-items-center'>
            <ion-col size="4">ID - Prompt</ion-col>
            <ion-col size="3">Category</ion-col>
            <ion-col size="1">Type</ion-col>
            <ion-col size="1">Order</ion-col>
            <!-- <ion-col size="1">Options</ion-col> -->
            <!-- <ion-col size="2">Validations</ion-col> -->
            <ion-col size="3">&nbsp;</ion-col>
          </ion-row>
          
          <ion-row v-for="question in questions" v-bind:key="question.id" class='ion-align-items-center'>
            <ion-col size="4">{{ question.id }} - {{ question.questionPrompt }}</ion-col>
            <!-- Use onclick function and a dynamic route rather than hardcoding -->
            <ion-col size="3"><a :href="'/admin/categories/' + question.categoryId">{{ categoriesMap.get(question.categoryId) }}</a></ion-col>
            <ion-col size="1">{{ question.answerType }}</ion-col>
            <ion-col size="1">{{ question.order }}</ion-col>
            <!-- <ion-col size="1">{{ question.options }}</ion-col> -->
            <!-- <ion-col size="2">{{ question.validations }}</ion-col> -->
            <ion-col size="3">
              <ion-button @click="editQuestion(question.id)">Edit</ion-button>
              <ion-button @click="deleteQuestion(question.id, question.questionPrompt)">Delete</ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  alertController,
  IonButton,
  IonContent,
  IonPage,
  IonTitle,

  // Data Table
  IonGrid,
  IonCol,
  IonRow,
} from '@ionic/vue';
import AdmAuthenticatedNav from '../components/AdmAuthenticatedNav.vue';
import AdmHeader from '../components/AdmHeader.vue';
import { useAuthenticatedNavLogic } from '../composables/useAuthenticatedNavLogic';
import { defineComponent, ref, Ref } from 'vue';
import { Router, useRouter } from 'vue-router';

import { RawFetchedEntities } from '../providers/EntityProvider';

import UserEntityProvider from '../providers/UserEntityProvider';
import { UserAttributes } from "../interfaces/UserInterfaces";

import CategoryEntityProvider from '../providers/CategoryEntityProvider';
import { CategoryAttributes } from "../interfaces/CategoryInterfaces";

import QuestionEntityProvider from '../providers/QuestionEntityProvider';
import { QuestionAttributes } from "../interfaces/QuestionInterfaces";

export default defineComponent({
  name: 'QuestionsOverview',
  components: {
    AdmAuthenticatedNav,
    AdmHeader,
    IonButton,
    IonContent,
    IonPage,
    IonTitle,

    // Data Table
    IonGrid,
    IonCol,
    IonRow,
  },
  setup() {
    const router: Router = useRouter();
    const { goToAsync, logoutAsync, goToLoggedInUserEditPage } = useAuthenticatedNavLogic(router);

    const users: Ref<UserAttributes[]> = ref([]);
    const categories: Ref<CategoryAttributes[]> = ref([]);
    const questions: Ref<QuestionAttributes[]> = ref([]);

    const userProvider = new UserEntityProvider();
    const categoryProvider = new CategoryEntityProvider();
    const questionProvider = new QuestionEntityProvider();

    const deleteUser =  (userId: number, displayName: string): void => {
      alertController.create({
        header: `Delete ${displayName}`,
        message: `Are you sure you want to delete ${displayName}? This action is irreversible.`,
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              userProvider.deleteAsync(userId).then((success: boolean) => {
                if (success) {
                  const removeIndex = users.value.map(user => user.id).indexOf(userId);

                  if (removeIndex >= 0) {
                    users.value.splice(removeIndex, 1);
                  }
                }
              });
            }
          },
          {
            text: 'No',
            role: 'cancel'
          }
        ],
      })
      // eslint-disable-next-line no-undef
      .then((alertController: HTMLIonAlertElement) => {
        alertController.present();
      })
    };

    // Create a User
    const createUser = (): void => {
      router.push({ name: 'UserCreatePage' });
    }

    // Go the the user edit page
    const editUser = (userId: number): void => {
      console.log(`editUser - about to edit user for userId=${userId}`);
      router.push({ name: 'UserEditPage', params: { entityId: userId }});
    };

    // Separate as function, when users return to page after editing user
    const updateUsersList = (): void => {
      userProvider.fetchAllAsync().then( (rawFetchedUsers: RawFetchedEntities<UserAttributes> | null): void => {
        if (rawFetchedUsers) {
          users.value = rawFetchedUsers.data;
          console.log(`Updating users list: ${JSON.stringify(users.value)}`);
        }
      });
    }

    /*
      Category Functions
    */

    const deleteCategory =  (userId: number, displayName: string): void => {
      alertController.create({
        header: `Delete ${displayName}`,
        message: `Are you sure you want to delete ${displayName}? This action is irreversible.`,
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              console.log(`Category confirmed choice to clear all`);
              categoryProvider.deleteAsync(userId).then((success: boolean) => {
                if (success) {
                  const removeIndex = categories.value.map(user => user.id).indexOf(userId);

                  if (removeIndex >= 0) {
                    categories.value.splice(removeIndex, 1);
                  }
                }
              });
            }
          },
          {
            text: 'No',
            role: 'cancel'
          }
        ],
      })
      // eslint-disable-next-line no-undef
      .then((alertController: HTMLIonAlertElement) => {
        alertController.present();
      })
    };

    // Create a Category
    const createCategory = (): void => {
      console.log("Create User");
      router.push({ name: 'CategoryCreatePage' });
    }

    // Go the the user edit page
    const editCategory = (categoryId: number): void => {
      console.log(`editCategory - about to edit user for categoryId=${categoryId}`);
      router.push({ name: 'CategoryEditPage', params: { entityId: categoryId }});
    };

    // Separate as function, when users return to page after editing user
    const updateCategoriesList = (): void => {
      categoryProvider.fetchAllAsync().then( (rawFetchedCategories: RawFetchedEntities<CategoryAttributes> | null): void => {
        if (rawFetchedCategories) {
          categories.value = rawFetchedCategories.data;
          console.log(`Updating categories list: ${JSON.stringify(categories.value)}`);
        }
      });
    }

    /*
      Question Functions
    */

    const deleteQuestion =  (userId: number, displayName: string): void => {
      alertController.create({
        header: `Delete ${displayName}`,
        message: `Are you sure you want to delete ${displayName}? This action is irreversible.`,
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              console.log(`Question confirmed choice to clear all`);
              questionProvider.deleteAsync(userId).then((success: boolean) => {
                if (success) {
                  const removeIndex = questions.value.map(user => user.id).indexOf(userId);

                  if (removeIndex >= 0) {
                    questions.value.splice(removeIndex, 1);
                  }
                }
              });
            }
          },
          {
            text: 'No',
            role: 'cancel'
          }
        ],
      })
      // eslint-disable-next-line no-undef
      .then((alertController: HTMLIonAlertElement) => {
        alertController.present();
      })
    };

    // Create a Question
    const createQuestion = (): void => {
      console.log("Create User");
      router.push({ name: 'QuestionCreatePage' });
    }

    // Go the the user edit page
    const editQuestion = (questionId: number): void => {
      console.log(`editQuestion - about to edit user for categoryId=${questionId}`);
      router.push({ name: 'QuestionEditPage', params: { entityId: questionId }});
    };

    // Separate as function, when users return to page after editing user
    const updateQuestionsList = (): void => {
      questionProvider.fetchAllAsync().then( (rawFetchedQuestions: RawFetchedEntities<QuestionAttributes> | null): void => {
        if (rawFetchedQuestions) {
          questions.value = rawFetchedQuestions.data;
          console.log(`Updating questions list: ${JSON.stringify(questions.value)}`);
        }
      });
    }

    // Function unique to QuestionsOverview.vue
    // Find category name based on id
    const categoriesMap = ref(new Map<number, string>());

    return {
      // Header
      goToAsync,
      logoutAsync,
      goToLoggedInUserEditPage,

      users,
      createUser,
      editUser,
      deleteUser,
      updateUsersList,

      categories,
      createCategory,
      editCategory,
      deleteCategory,
      updateCategoriesList,

      questions,
      createQuestion,
      editQuestion,
      deleteQuestion,
      updateQuestionsList,

      categoriesMap,
    }
  },
  ionViewWillEnter(): void {
    this.updateUsersList(); // @todo Not updating users list after edit
    this.updateCategoriesList(); // @todo Not updating category list after edit
    this.updateQuestionsList();

    this.categories.forEach((val: CategoryAttributes) => this.categoriesMap.set(val.id, val.description));
    console.log(this.categoriesMap)

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    setTimeout(() => {
      this.updateUsersList(); // @todo Not updating users list after edit
      this.updateCategoriesList(); // @todo Not updating category list after edit
      this.updateQuestionsList();

      this.categories.forEach((val: CategoryAttributes) => this.categoriesMap.set(val.id, val.description));
      console.log(this.categoriesMap)
    }, 1000);

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    setTimeout(() => {
      this.updateUsersList(); // @todo Not updating users list after edit
      this.updateCategoriesList(); // @todo Not updating category list after edit
      this.updateQuestionsList();

      this.categories.forEach((val: CategoryAttributes) => this.categoriesMap.set(val.id, val.description));
      console.log(this.categoriesMap)
    }, 3000);
  },
});
</script>

<style scoped>
#container {
  margin: 3rem auto;
  max-width: 60rem;
  text-align: center;
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;
}

#container a {
  text-decoration: none;
}
</style>
