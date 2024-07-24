<template>
  <div class="survey-footer">
    <div class="footer-buttons">
      <ion-button class="clearall-button" fill="clear" @click="onClearAll">Clear All</ion-button>
      <ion-button class="submit-button" type="submit" @click="onSubmit">Submit</ion-button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  IonButton,
} from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "TrkSurveyFooter",
  components: {
    IonButton,
  },
  props: {
    onClearAll: {
      type: Function,
      required: true
    },
    onSubmit: {
      type: Function,
      required: true
    }
  },
});
</script>

<style scoped>
.footer-buttons {
  display: flex;
  justify-content: space-between;
}
</style>
