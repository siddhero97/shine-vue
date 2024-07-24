<template>
  <ion-page>
    <adm-header></adm-header>

    <ion-content>
      <div id="main">
        <h2>Login</h2>

        <ion-card>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label position="floating">Mobile Phone</ion-label>
                <ion-input
                  type="tel"
                  v-model="userInfo.mobilePhone"
                  debounce="100"
                  inputmode="text"
                  required="true"
                  v-on:keyup.enter="onSubmit"
                ></ion-input>
              </ion-item>

              <ion-item>
                <ion-label position="floating">Password</ion-label>
                <ion-input
                  type="password"
                  v-model="userInfo.password"
                  debounce="100"
                  inputmode="text"
                  required="true"
                  v-on:keyup.enter="onSubmit"
                ></ion-input>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
        <div class="admin-footer">
          <div class="footer-buttons">
            <ion-button class="submit-button" type="submit" @click="onSubmit"
              >Submit</ion-button
            >
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonButton,
  IonContent,
  IonPage,

  // @todo Abstract later
  IonInput,
  IonItem,
  IonList,
  IonCard,
  IonCardContent,
  IonLabel,

  onIonViewWillEnter,
} from "@ionic/vue";
import AdmHeader from '../components/AdmHeader.vue';
import { useSession } from "../composables/useSession";
import { useStore } from "../store/adminStore";
import { defineComponent, Ref, ref } from "vue";
import { Router, useRouter } from "vue-router";

export default defineComponent({
  name: "QuestionEditPage",
  components: {
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
    const { submitSessionAsync } = useSession();
    const { clearSession: clearStoreSession, clearState: clearStoreState } = useStore().methods;
    const userInfo: Ref<any> = ref({
      mobilePhone: "", // @TODO change to userIdentifier, incl. phone & email
      password: "",
    });

    // Handler for "submit" button's click
    const onSubmit = (): void => {
      console.log(`onSubmit: before submitSessionAsync call`);
      submitSessionAsync(
        userInfo.value.mobilePhone,
        userInfo.value.password
      ).then((isAuthenticated: boolean) => {
        if (isAuthenticated) {
          console.log(`onSubmit: after submitSessionAsync resolved`);

          router.push({ name: `AdminHomePage` });
        } else {
          alert(`The login information was incorrect`);
          console.log(`The login information was incorrect`);
        }
      });
    };

    onIonViewWillEnter(() => {
      // Make sure residual session or state (if any) is cleared from the store
      clearStoreSession();
      clearStoreState();

      // Make sure residual login information is also cleared.
      userInfo.value.mobilePhone = "";
      userInfo.value.password = "";
    })

    return {
      userInfo,
      onSubmit,
    };
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
</style>
