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
        <h2>Edit User <em>{{ user.state.displayName }}</em></h2>

        <ion-card>
          <!-- <ion-card-header>
            <ion-card-title>User Attributes</ion-card-title>
          </ion-card-header> -->
          <ion-card-content>
            
            <div>Created at {{ formatDate(user.state.createdAt) }}</div>
            <div>Updated at {{ formatDate(user.state.updatedAt) }}</div>
            <ion-list>              
              <ion-item>
                <ion-label position="floating">Display Name *</ion-label>
                <ion-input type="text" v-model="user.state.displayName" debounce="100" inputmode="text" required=true></ion-input>
              </ion-item>
              
              <ion-item>
                <ion-label position="floating">Mobile Phone *</ion-label>
                <ion-input type="tel" v-model="user.state.mobilePhone" debounce="100" inputmode="text" required=true></ion-input>
              </ion-item>
              
              <ion-item>
                <ion-label position="floating">Email</ion-label>
                <ion-input type="email" v-model="user.state.email" debounce="100" inputmode="text"></ion-input>
              </ion-item>

              <ion-item v-show="user.state.id > 0">
                <ion-label position="floating">Old Password {{ user.state.password?.length > 0 ? '*' : '' }}</ion-label>
                <ion-input type="password" v-model="user.state.oldPassword" debounce="100" inputmode="text"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Password{{ user.state.id > 0 ? '' : '*' }}</ion-label>
                <ion-input type="password" v-model="user.state.password" debounce="100" inputmode="text"></ion-input>
              </ion-item>
              
              <ion-item>
                <ion-label position="floating">Confirm Password{{ user.state.id > 0 ? '' : '*' }}</ion-label>
                <ion-input type="password" v-model="user.state.confirmPassword" debounce="100" inputmode="text"></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Categories</ion-label>
                <ion-select v-model="user.state.categories" :compareWith="checkCategories" multiple="true">
                  <ion-select-option
                    v-for="category in categoryList || []"
                    v-bind:key="category.id"
                    :value="category"
                  >{{ category.description }}</ion-select-option>
                </ion-select>
              </ion-item>

            </ion-list>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-content>
            <h2>User Notfications</h2>
            <ion-list>
              <ion-item v-for="notification in user.state.notifications || []" v-bind:key="notification.id">
                Every &nbsp; 
                <ion-select class="notification__input"
                  v-model="notification.daysToSend">
                  <ion-select-option value="0">Sunday</ion-select-option>
                  <ion-select-option value="1">Monday</ion-select-option>
                  <ion-select-option value="2">Tuesday</ion-select-option>
                  <ion-select-option value="3">Wednesday</ion-select-option>
                  <ion-select-option value="4">Thursday</ion-select-option>
                  <ion-select-option value="5">Friday</ion-select-option>
                  <ion-select-option value="6">Saturday</ion-select-option>
                </ion-select>,
                send a &nbsp; 
                <ion-select class="notification__input" v-model="notification.typeOfNotification">
                  <!-- <ion-select-option value="textAndEmail">Text &amp; Email</ion-select-option> -->
                  <ion-select-option value="text">Text Message</ion-select-option>
                  <!-- <ion-select-option value="email">Email</ion-select-option> -->
                </ion-select>
                at &nbsp; 
                
                <ion-datetime class="notification__input"
                  v-model="notification.timeToSend"
                  minuteValues="0,15,30,45"
                  displayFormat="h:mm A"
                  value="12:30"></ion-datetime>
                <ion-button type="button" fill="outline" @click="deleteNotification(notification.id)">Delete</ion-button>
              </ion-item>
              <ion-item>
                <ion-button class="notification__add-another" type="button" fill="outline" @click="addAnotherNotification">+ Add Notification</ion-button>
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
  IonDatetime
} from "@ionic/vue";
import AdmAuthenticatedNav from '../components/AdmAuthenticatedNav.vue';
import AdmHeader from '../components/AdmHeader.vue';
import { useAuthenticatedNavLogic } from '../composables/useAuthenticatedNavLogic';
import { useUser } from "../composables/useUser";
import { defineComponent } from "vue";
import { Router, useRouter } from 'vue-router';
 
// Date Formatting
import moment from 'moment'
import { CategoryAttributes } from "../interfaces/CategoryInterfaces";
import { RawFetchedEntities } from "../providers/EntityProvider";
import { UserAttributes, TypesOfNotification, UserNotificationAttributes } from "../interfaces/UserInterfaces";

export default defineComponent({
  name: "UserEditPage",
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
    IonDatetime
  },
  setup() {
    const router: Router = useRouter();
    const { goToAsync, logoutAsync, goToLoggedInUserEditPage } = useAuthenticatedNavLogic(router);
    const {  user, categoryList, loadUserAsync, submitUserAsync, getRawCategoriesAsync, clearAll } = useUser();

    // Handler for "submit" button's click
    const onSubmit = (): boolean => {
      let result = false;

      console.log(`onSubmit: before submitUserAsync call`);
      console.log(`User Value is ${JSON.stringify(user.value)}`);
      result =  submitUserAsync().then((wasSuccessful: boolean) => {
        console.log(`onSubmit: after submitUserAsync resolved. wasSuccessful = ${wasSuccessful}`);
        if (wasSuccessful) {
          clearAll();
          router.push({ name: 'UsersOverview' });
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

      return result;
    };

    const onCancel = (): void => {
      router.push({ name: 'UsersOverview' });
    };

    // Load Categories, @TODO signify if async or not
    const loadCategoriesAsync = async () => {
      return getRawCategoriesAsync().then( async (rawFetchedCategories: RawFetchedEntities<CategoryAttributes> | null) => {
        if (rawFetchedCategories) {
          categoryList.value = rawFetchedCategories.data;
        }
      })
    }


    // Format the creation + update time
    const formatDate = function (value: string | null){
        if (value) {
          return moment(String(value)).format('MMMM Do YYYY, h:mm:ss a')
        }
    };

    // Help Vue select the correct category
    const checkCategories = (category1: UserAttributes, category2: UserAttributes | UserAttributes[]) => {
      let result = false;
      if (Array.isArray(category2)) {
        result = category2.some((current) => current.id === category1.id);
      }
      else {
        result = category1 && category2 ? category1.id === category2.id : category1 === category2;
      }
      // console.log('checkCategories' + JSON.stringify([result, category1, category2]));
      return result;
    }

    // Add a notification with a negative id
    let negativeIdCounter = -1;
    const addAnotherNotification = () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { createdAt, updatedAt, ...newNotification } = user.value.state.notifications.slice(-1)[0] || {
        daysToSend: `3`,
        typeOfNotification: `text`,
        timeToSend: `12:00:00`
      }; // Get last notification
      newNotification.id = negativeIdCounter--;
      user.value.state.notifications.push(newNotification);
    }

    // Delete a notification by id
    const deleteNotification = (notificationIdToDelete: number) => {
      user.value.state.notifications = user.value.state.notifications.filter(
        (notification: UserNotificationAttributes) => notification.id !== notificationIdToDelete);
    }
    
    return {
      user,
      categoryList,
      goToAsync,
      logoutAsync,
      goToLoggedInUserEditPage,
      loadUserAsync,
      onCancel,
      onSubmit,
      formatDate,
      loadCategoriesAsync,
      checkCategories,
      TypesOfNotification,
      addAnotherNotification,
      deleteNotification,
    };
  },
  ionViewWillEnter(): void {
    console.log(`UserViewPage: ionViewWillEnter: before loadUserAsync call`);
    Promise.all([
      this.loadUserAsync('@?includeModels=categories,notifications'),
      this.loadCategoriesAsync()
    ]).then(() => {
        // Force select list to rerender. See https://github.com/Youth-Unlimited/tracker/issues/128
        console.log(this.user.state.categories.length );
        if (this.user.state.categories.length > 0) {
            const userCats = this.user.state.categories;
            this.user.state.categories = [];
            setTimeout(() => {
              this.user.state.categories = userCats;
            }, 0);
            
          // --user.value.state.categories[0]['id'];
        }
      });
  },
});
</script>

<style scoped>
#main {
  margin: 1rem auto;
  max-width: 60rem;
}

.footer-buttons {
  display: flex;
  justify-content: space-between;
}

.notification__input {
  font-weight: bold;
  background: #eee;
  padding: 0 0.3em;
  min-width: 4em;
}
</style>
