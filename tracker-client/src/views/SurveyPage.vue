<template>
  <trk-page-base-layout>
    <trk-survey-header
      :displayName="survey.properties.displayName"
      :surveyDate="survey.properties.surveyDate">
    </trk-survey-header>
    <trk-category
      v-for="category in survey.nested"
      :key="category.properties.categoryId"
      :properties="category.properties"
      :nested="category.nested"
      v-model="category.state">
    </trk-category>
    <trk-survey-errors v-if="hasErrors"
      :mainErrorMessage="mainErrorMessage"
      :additionalDetails="additionalDetails"
    >
    </trk-survey-errors>
    <trk-survey-footer
      :onClearAll="onClearAll"
      :onSubmit="onSubmit">
    </trk-survey-footer>
    <trk-survey-debug-info v-if="isSurveyDebugAvailable"
      :surveyId="survey.properties.surveyId"
      :debugSurveyNested="debugSurveyNested"
      :debugSurveyProperties="debugSurveyProperties">
    </trk-survey-debug-info>
  </trk-page-base-layout>
</template>

<script lang="ts">
import {
  alertController,
  onIonViewWillEnter,
} from "@ionic/vue";
import TrkCategory from "../components/TrkCategory.vue";
import TrkPageBaseLayout from "../components/TrkPageBaseLayout.vue";
import TrkSurveyDebugInfo from "../components/TrkSurveyDebugInfo.vue";
import TrkSurveyErrors from "../components/TrkSurveyErrors.vue";
import TrkSurveyFooter from "../components/TrkSurveyFooter.vue";
import TrkSurveyHeader from "../components/TrkSurveyHeader.vue";
import { useSurvey, useSurveyDebug } from "../composables/useSurvey";
import { useValidationMessageBuilder } from "../composables/validationMessageBuilder";
import { computed, defineComponent, ref, Ref } from "vue";
import { useLogger, VueLogger } from "vue-logger-plugin";
import { Router, useRouter } from 'vue-router';

export default defineComponent({
  name: "SurveyPage",
  components: {
    TrkCategory,
    TrkPageBaseLayout,
    TrkSurveyDebugInfo,
    TrkSurveyErrors,
    TrkSurveyFooter,
    TrkSurveyHeader
  },
  setup() {
    const logger: VueLogger = useLogger();
    const router: Router = useRouter();
    const { survey, getServerValidationErrors, getTrimmedSubmitResultMessage, loadSurveyAsync, clearAll, submitSurveyAsync } = useSurvey(logger);
    const { buildServerValidationErrorMessages } = useValidationMessageBuilder(logger);

    // TODO: This is just to show debugging information
    const { isSurveyDebugAvailable, debugSurveyNested, debugSurveyProperties } = useSurveyDebug();

    const mainErrorMessage: Ref<string> = ref('');
    const additionalDetails: Ref<Array<string>> = ref([]);
    const hasErrors: Ref<boolean> = computed(() => {
      return mainErrorMessage.value.length > 0;
    });

    // Presents the "Clear All" alert prompt.
    const presentClearAllAlertAsync = async (): Promise<void> => {
      // NOTE: Ionic framework seems to have a problem exposing the return
      //       type of HTMLIonAlertElement, so we can't declare the type of the
      //       clearAllAlert variable explicitly
      const clearAllAlert = await alertController.create({
        header: 'Confirm Clear All',
        message: 'Do you want to clear all the information you entered?',
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              logger.debug(`User confirmed choice to clear all`);
              clearAll();
            }
          },
          {
            text: 'No',
            role: 'cancel'
          }
        ],
      });

      await clearAllAlert.present();
    }

    // Handler for "Clear All" button's click.
    const onClearAll = (): void => {
      // NOTE: This is an asynchronous call but we aren't calling anything after
      //       it, so we don't need a "then".
      presentClearAllAlertAsync();
    };

    // Handler for "submit" button's click
    const onSubmit = (): void => {
      logger.debug(`onSubmit: before submitSurveyAsync call`);
      submitSurveyAsync().then((wasAccepted: boolean) => {

        // Allow users to move to another page now
        window.removeEventListener('beforeunload', preventAccidentReload);

        logger.debug(`onSubmit: after submitSurveyAsync resolved - wasAccepted = ${wasAccepted}`);
        if (wasAccepted) {
          router.push({ name: 'SummaryPage', params: { surveyId: survey.value.properties.surveyId }});
        } else {
          // We stay on the same page but update the error area
          mainErrorMessage.value = getTrimmedSubmitResultMessage();
          additionalDetails.value = buildServerValidationErrorMessages(
            getServerValidationErrors(), survey.value.properties);
        }
      }).catch(() => {
        // TODO: Improve logging in this catch block.
        mainErrorMessage.value = 'An unexpected error happened while submitting your survey.';
      });
    };

    onIonViewWillEnter(() => {
      mainErrorMessage.value = '';
      logger.debug(`SurveyPage: onIonViewWillEnter: before loadSurveyAsync call`);
      loadSurveyAsync().then(() => {
        logger.debug(`SurveyPage: onIonViewWillEnter: after loadSurveyAsync resolved`);
      });
    });

    // Stop users from reloading the page before they save their work
    const preventAccidentReload = (e: Event) => {
      e.preventDefault();
      return 'You have unsaved work';
    }
    window.addEventListener('beforeunload', preventAccidentReload);

    return {
      survey,
      onClearAll,
      onSubmit,
      additionalDetails,
      hasErrors,
      mainErrorMessage,
      isSurveyDebugAvailable,
      debugSurveyNested,
      debugSurveyProperties
    };
  },
});
</script>

<style scoped>
</style>
