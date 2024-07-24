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
      <div class="home">
        <ion-title size="medium">Home</ion-title>
        <ion-grid class="main-links-container">
          <ion-row>
            <ion-col>
              <p class="ion-text-start">What administrative area would you like to go to?</p>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-button class="ion-text-start" @click="goToAsync('UsersOverview')">
                People
              </ion-button>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-button class="ion-text-start" @click="goToAsync('CategoriesOverview')">
                Projects
              </ion-button>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col>
              <ion-button class="ion-text-start" @click="goToAsync('QuestionsOverview')">
                Questions
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonPage,
  IonRow,
  IonTitle,
} from '@ionic/vue';
import AdmAuthenticatedNav from '../components/AdmAuthenticatedNav.vue';
import AdmHeader from '../components/AdmHeader.vue';
import { useAuthenticatedNavLogic } from '../composables/useAuthenticatedNavLogic';
import { defineComponent } from 'vue';
import { Router, useRouter } from 'vue-router';

export default defineComponent({
  name: 'AdminHomePage',
  components: {
    AdmAuthenticatedNav,
    AdmHeader,
    IonButton,
    IonCol,
    IonContent,
    IonGrid,
    IonPage,
    IonRow,
    IonTitle,
  },
  setup() {
    const router: Router = useRouter();
    const { goToAsync, logoutAsync, goToLoggedInUserEditPage } = useAuthenticatedNavLogic(router);

    return {
      goToAsync,
      logoutAsync,
      goToLoggedInUserEditPage,
    };
  },
});
</script>

<style scoped>
.home {
  margin: 3rem auto;
  max-width: 60rem;
  text-align: left;
}

.home .main-links-container {
  margin-top: 1em;
}
</style>
