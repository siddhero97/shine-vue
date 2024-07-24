<template>
  <ion-header :translucent="true">
    <ion-toolbar color="secondary">
      <ion-title>{{ siteName }} Admin Panel</ion-title>
      <slot></slot>
    </ion-toolbar>
  </ion-header>
</template>

<script lang="ts">
import {
  IonHeader,
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "AdmHeader",
  components: {
    IonHeader,
    IonTitle,
    IonToolbar,
  },
  setup() {
    return {
      siteName: process.env.VUE_APP_API_SITE_NAME,
    }
  }
});
</script>

<style scoped>
</style>
