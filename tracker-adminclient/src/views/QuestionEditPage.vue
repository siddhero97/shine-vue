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
      <div id="main">
        <h2>Edit Question <em>{{ question.state.questionPrompt }}</em></h2>

        <ion-card>
          <!-- <ion-card-header>
            <ion-card-title>Question Attributes</ion-card-title>
          </ion-card-header> -->
          <ion-card-content>
            
            <div>Created at {{ formatDate(question.state.createdAt) }}</div>
            <div>Updated at {{ formatDate(question.state.updatedAt) }}</div>
            <ion-list>              
              <ion-item>
                <ion-label position="floating">Question Prompt</ion-label>
                <ion-input type="text" v-model="question.state.questionPrompt" debounce="100" inputmode="text"></ion-input>
              </ion-item>
              
              <ion-item>
                <ion-label position="floating">Answer Type</ion-label>                
                <ion-select v-model="question.state.answerType">
                  <ion-select-option
                    v-for="answerType in answerTypes"
                    v-bind:key="answerType.id"
                    :value="answerType.id"
                  >{{ answerType.name }}</ion-select-option>
                </ion-select>
              </ion-item>
              
              <ion-item>
                <ion-label position="floating">Order</ion-label>
                <ion-input type="number" v-model="question.state.order" debounce="100" inputmode="number"></ion-input>
                <p class="help-text">Questions with lowest order values appear on top.</p>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Category</ion-label>
                <ion-select v-model="question.state.categoryId">
                  <ion-select-option
                    v-for="category in categoryList"
                    v-bind:key="category.id"
                    :value="category.id"
                  >{{ category.description }}</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
        <div class="survey-footer">
          <div class="footer-buttons">
            <ion-button class="cancel-button" type="button" fill="outline" @click="onCancel">Cancel</ion-button>
            <ion-button class="submit-button" type="submit" @click="onSubmit">Submit</ion-button>
          </div>
        </div>
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

  // @todo Abstract later
  IonInput,
  IonItem,
  IonList,
  IonCard,
  IonCardContent,
  IonSelectOption,
  IonSelect,
  // IonCardTitle,
  // IonCardHeader,
  IonLabel,
} from "@ionic/vue";
import AdmAuthenticatedNav from '../components/AdmAuthenticatedNav.vue';
import AdmHeader from '../components/AdmHeader.vue';
import { useAuthenticatedNavLogic } from '../composables/useAuthenticatedNavLogic';
import { useQuestion } from "../composables/useQuestion";
import { defineComponent } from "vue";
import { Router, useRouter } from 'vue-router';
 
// Date Formatting
import moment from 'moment'
import { RawFetchedEntities } from "../providers/EntityProvider";
import { CategoryAttributes } from "../interfaces/CategoryInterfaces";

export default defineComponent({
  name: "QuestionEditPage",
  components: {
    AdmAuthenticatedNav,
    AdmHeader,
    IonButton,
    IonContent,
    IonPage,
    IonSelectOption,
    IonSelect,

    // @todo Abstract later
    IonInput,
    IonItem,
    IonList,
    IonCard,
    IonCardContent,
    // IonCardTitle,
    // IonCardHeader,
    IonLabel,
  },
  setup() {
    const router: Router = useRouter();
    const { goToAsync, logoutAsync, goToLoggedInUserEditPage } = useAuthenticatedNavLogic(router);
    const {  question, categoryList, loadQuestionAsync, submitQuestionAsync, fetchAllCategoriesAsync, clearAll } = useQuestion();
    
    // @TODO Should we hardcore the answer types?
    const answerTypes = [
      {
        id: 'string',
        name: 'Short Text',
      },
      {
        id: 'number',
        name: 'Number',
      },
      {
        id: 'boolean',
        name: 'Boolean',
      }
    ];

    // TODO: This is just to show debugging information
    // const { debugQuestionAttributes } = useQuestionDebug();

    // Handler for "submit" button's click
    const onSubmit = (): void => {
      console.log(`onSubmit: before submitSurveyAsync call`);
      console.log(`Question Value is ${JSON.stringify(question.value)}`);
      submitQuestionAsync().then((wasSuccessful: boolean) => {
        console.log(`onSubmit: after submitSurveyAsync resolved`);
        if (wasSuccessful) {
          clearAll();
          router.push({ name: 'QuestionsOverview'});
        }
        else {
          alertController.create({
            header: `There was an error`,
            message: `There was an issue saving the form. Please review the form and try again.`,
            buttons: [
              {
                text: 'Ok',
                role: 'cancel'
              }
            ],
          })
          // eslint-disable-next-line no-undef
          .then((alertController: HTMLIonAlertElement) => {
            alertController.present();
          })
        }
      });
    };

    const onCancel = (): void => {
      router.push({ name: 'QuestionsOverview' });
    };

    // Load Categories
    const loadCategoriesAsync = () => {
      return fetchAllCategoriesAsync().then( (rawFetchedCategories: RawFetchedEntities<CategoryAttributes> | null): void => {
        if (rawFetchedCategories) {
          categoryList.value = rawFetchedCategories.data;
        }
      });
    };

    // Format the creation + update time
    const formatDate = function (value: string | null){
        if (value) {
          return moment(String(value)).format('MMMM Do YYYY, h:mm:ss a')
        }
    };

    return {
      question,
      goToAsync,
      logoutAsync,
      goToLoggedInUserEditPage,
      loadQuestionAsync,
      onCancel,
      onSubmit,
      formatDate,
      loadCategoriesAsync,
      answerTypes,
      categoryList,
    };
  },
  ionViewWillEnter(): void {
    console.log(`QuestionViewPage: ionViewWillEnter: before loadQuestionAsync call`);

    Promise.all([
      this.loadQuestionAsync(),
      this.loadCategoriesAsync()
    ]).then(() => {
        // Force select list to rerender. See https://github.com/Youth-Unlimited/tracker/issues/128
        let categoryId = this.question.state.categoryId;
        this.question.state.categoryId = 0;
        setTimeout(() => {
          this.question.state.categoryId = categoryId;
        }, 0);
      });
  },
});
</script>

<style scoped>
#main {
  margin: 1rem auto;
  max-width: 30rem;
}

.footer-buttons {
  display: flex;
  justify-content: space-between;
}

.help-text {
  color: #999;
}
</style>
