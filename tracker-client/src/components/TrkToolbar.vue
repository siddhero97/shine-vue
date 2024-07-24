<template>
  <ion-toolbar color="secondary">
    <div class="trk-toolbar">
      <ion-title class="trk-title" :size="titleSize">{{ siteName }}</ion-title>
    </div>
  </ion-toolbar>
</template>

<script lang="ts">
import {
  IonTitle,
  IonToolbar,
} from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "TrkToolbar",
  components: {
    IonTitle,
    IonToolbar,
  },
  props: {
    titleSize: {
      type: String,
      required: false
    },
  },
  setup() {
    return {
      siteName: process.env.VUE_APP_API_SITE_NAME,
    }
  }
});
</script>

<style scoped>
.trk-toolbar {
  margin: 0.5rem auto;
  max-width: 30rem;
  text-align: center;
}

.trk-toolbar .trk-title {
  margin-bottom: 1rem;
}
</style>
