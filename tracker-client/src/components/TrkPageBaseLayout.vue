<template>
  <ion-page>
    <ion-header :translucent="true">
      <trk-toolbar></trk-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <trk-toolbar titleSize="large"></trk-toolbar>
      </ion-header>

      <div id="content-container">
        <slot></slot>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage
} from '@ionic/vue';
import TrkToolbar from "./TrkToolbar.vue";
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TrkPageBaseLayout',
  components: {
    IonContent,
    IonHeader,
    IonPage,
    TrkToolbar
  },
});
</script>

<style scoped>
#content-container {
  margin: 1rem auto;
  max-width: 30rem;
}
</style>
