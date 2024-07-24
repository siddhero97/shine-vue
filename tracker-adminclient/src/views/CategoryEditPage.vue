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
        <h2>Edit Category <em>{{ category.state.description }}</em></h2>

        <ion-card>
          <!-- <ion-card-header>
            <ion-card-title>Category Attributes</ion-card-title>
          </ion-card-header> -->
          <ion-card-content>
            
            <div>Created at {{ formatDate(category.state.createdAt) }}</div>
            <div>Updated at {{ formatDate(category.state.updatedAt) }}</div>
            <ion-list>              
              <ion-item>
                <ion-label position="floating">Description</ion-label>
                <ion-input type="text" v-model="category.state.description" debounce="100" inputmode="text"></ion-input>
              </ion-item>
              
              <ion-item>
                <ion-label position="floating">Order</ion-label>
                <ion-input type="number" v-model="category.state.order" debounce="100" inputmode="text"></ion-input>
                <p class="help-text">Categories with lowest order values appear on top.</p>
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
/**
 * Same as UserEditPage, but with following changes:
 *  - Replace Users w/ Categories
 *  - Replace User w/ Category
 *  - Replace user w/ category
 * 
 *  - Remove getting a list of categories
 *  - Update Template
 *  - Remove IonSelect + IonSelectOption
 */

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
  // IonCardTitle,
  // IonCardHeader,
  IonLabel,
} from "@ionic/vue";
import AdmAuthenticatedNav from '../components/AdmAuthenticatedNav.vue';
import AdmHeader from '../components/AdmHeader.vue';
import { useAuthenticatedNavLogic } from '../composables/useAuthenticatedNavLogic';
import { useCategory } from "../composables/useCategory";
import { defineComponent, } from "vue";
import { Router, useRouter } from 'vue-router';
 
// Date Formatting
import moment from 'moment'

export default defineComponent({
  name: "CategoryEditPage",
  components: {
    AdmAuthenticatedNav,
    AdmHeader,
    IonButton,
    IonContent,
    IonPage,

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
    const {  category, loadCategoryAsync, submitCategoryAsync, clearAll } = useCategory();

    // TODO: This is just to show debugging information
    // const { debugCategoryAttributes } = useCategoryDebug();

    // Handler for "submit" button's click
    const onSubmit = (): void => {
      console.log(`onSubmit: before submitCategoryAsync call`);
      console.log(`Category Value is ${JSON.stringify(category.value)}`);
      submitCategoryAsync().then((wasSuccessful: boolean) => {
        console.log(`onSubmit: after submitCategoryAsync resolved`);
        if (wasSuccessful) {
          clearAll();
          router.push({ name: 'CategoriesOverview'});
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
      router.push({ name: 'CategoriesOverview'});
    };

    // Format the creation + update time
    const formatDate = function (value: string | null){
        if (value) {
          return moment(String(value)).format('MMMM Do YYYY, h:mm:ss a')
        }
    };


    return {
      category,
      goToAsync,
      logoutAsync,
      goToLoggedInUserEditPage,
      loadCategoryAsync,
      onCancel,
      onSubmit,
      formatDate,
    };
  },
  ionViewWillEnter(): void {
    console.log(`CategoryViewPage: ionViewWillEnter: before loadCategoryAsync call`);
    this.loadCategoryAsync().then(() => {
      console.log(`CategoryViewPage: ionViewWillEnter: after loadCategoryAsync resolved`);
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
