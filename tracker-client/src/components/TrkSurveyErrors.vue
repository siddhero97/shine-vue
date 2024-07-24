<template>
  <ion-card class="survey-errors" color="danger">
    <ion-card-header class="survey-errors-header">
      <ion-card-title class="survey-errors-title">Errors</ion-card-title>
    </ion-card-header>
    <ion-card-content class="survey-errors-content">
      <p>{{ mainErrorMessage }}</p>
      <ul class="survey-errors-details">
        <li v-for="detail in indexedDetails"
         :key="detail.index">{{ detail.message }}</li>
      </ul>
    </ion-card-content>
  </ion-card>
</template>

<script lang="ts">
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from "@ionic/vue";
import { computed, defineComponent, PropType, Ref } from "vue";

export default defineComponent({
  name: "TrkSurveyErrors",
  components: {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
  },
  props: {
    mainErrorMessage: {
      type: String,
      required: true
    },
    additionalDetails: {
      type: Array as PropType<Array<string>>,
      required: true
    }
  },
  setup(props) {
    const indexedDetails: Ref<{index: number; message: string}[]> = computed(() => {
      return props.additionalDetails.map((detailMessage, index) => {
        return {
          index,
          message: detailMessage
        };
      });
    });

    return {
      indexedDetails
    };
  }
});
</script>

<style scoped>
.survey-errors-title {
  font-weight: bold;
}
</style>
