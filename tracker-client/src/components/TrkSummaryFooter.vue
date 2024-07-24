<template>
  <div class="summary-footer">
    <div class="footer-buttons">
      <ion-button class="edit-button" fill="clear" type="submit" @click="onEdit">Edit</ion-button>
      <ion-button class="done-button" type="submit" @click="onDone">Done</ion-button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  IonButton,
} from "@ionic/vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "TrkSummaryFooter",
  components: {
    IonButton,
  },
  props: {
    onEdit: {
      type: Function,
      required: true
    },
    onDone: {
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
