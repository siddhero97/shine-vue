<template>
  <div class="header-second" slot="secondary">
    <ion-buttons class="main-menu">
      <ion-button @click="goToAsync('AdminHomePage')">
        Home
      </ion-button>
      <ion-button @click="goToAsync('UsersOverview')">
        Users
      </ion-button>
      <ion-button @click="goToAsync('CategoriesOverview')">
        Programs
      </ion-button>
      <ion-button @click="goToAsync('QuestionsOverview')">
        Questions
      </ion-button>
    </ion-buttons>
    <ion-buttons class="user-menu">
       <!-- @TODO is there a better way than "hacking" a button? -->
      <ion-button disabled class="user-menu__username">
        Hi {{ session.userDisplayName }}
      </ion-button>
       <!-- @TODO Should this button just be the username? -->
      <ion-button @click="goToLoggedInUserEditPage()">
        My Account
      </ion-button>
      <ion-button @click="logoutAsync()">
        Log Out
      </ion-button>
    </ion-buttons>
  </div>
</template>

<script lang="ts">
import {
  IonButton,
  IonButtons,
} from "@ionic/vue";
import { defineComponent, Ref } from "vue";
import { useSession } from "../composables/useSession";
import { Session } from "../interfaces/SessionInterfaces";


export default defineComponent({
  name: "AdmAuthenticatedNav",
  components: {
    IonButton,
    IonButtons,
  },
  props: {
    goToAsync: {
      type: Function,
      required: true
    },
    logoutAsync: {
      type: Function,
      required: true
    },
    goToLoggedInUserEditPage: {
      type: Function,
      required: true,
    }
  },
  setup() {
    const sessionComposable = useSession();
    const session = sessionComposable.session as Ref<Session>;

    return {
      session,
    };
  },
});
</script>

<style scoped>
.header-second {
  display: flex;
  flex-wrap: wrap;
}

.user-menu {
  margin-left: 3em;
}

.user-menu__username {
  font-weight: bold;
}
</style>
