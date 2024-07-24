<template>
  <div class="survey-debug-info">
    <div class="debug-buttons">
      <ion-button class="showhide-button" fill="clear" @click="toggleShowing">{{ showHideButtonCaption }}</ion-button>
    </div>
    <div class="debug-details" v-show="isShowing">
      <p>
        <em>(DEBUG: Survey id: {{ surveyId }})</em>
      </p>
      <div class="debug-survey-data-struture">
        <h2><em>DEBUG: Survey Nested (State) Data</em></h2>
        <pre>{{ debugSurveyNested }}</pre>
      </div>
      <div class="debug-survey-data-struture">
        <h2><em>DEBUG: Survey Properties Data</em></h2>
        <pre>{{ debugSurveyProperties }}</pre>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  IonButton,
} from "@ionic/vue";
import { computed, defineComponent, ref, Ref } from "vue";
import { useLogger, VueLogger } from "vue-logger-plugin";

export default defineComponent({
  name: "TrkSurveyDebugInfo",
  components: {
    IonButton,
  },
  props: {
    surveyId: {
      type: Number,
      required: true
    },
    debugSurveyNested: {
      type: String,
      required: true
    },
    debugSurveyProperties: {
      type: String,
      required: true
    }
  },
  setup() {
    const logger: VueLogger = useLogger();
    const isShowing: Ref<boolean> = ref(false); // debug info is hidden initially

    const showHideButtonCaption: Ref<string> = computed(() => {
      // The button's caption should be the action taken.
      // If we are showing it, the button should say "hide", and vice versa.
      return isShowing.value ? "- Hide Debug Info" : "+ Show Debug Info";
    });

    const toggleShowing = (): void => {
      logger.debug(`toggleShowing: old isShowing value: ${isShowing.value}`);
      isShowing.value = !isShowing.value;
      logger.debug(`toggleShowing: new isShowing value: ${isShowing.value}`);
    };

    return {
      isShowing,
      showHideButtonCaption,
      toggleShowing
    }
  }
});
</script>

<style scoped>
.survey-debug-info {
  margin-top: 1.5rem;
  border-top: 2px solid var(--ion-color-primary);
}
.debug-buttons {
  display: flex;
  justify-content: flex-end;
}
.debug-survey-data-struture {
  margin: 2rem 0 1rem 1rem;
  padding: 1rem 2rem;
  border: 2px solid var(--ion-color-primary);
  color: var(--ion-color-medium);
}
</style>
