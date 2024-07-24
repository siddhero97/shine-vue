<template>
  <trk-page-base-layout>
    <trk-summary-header
      :displayName="survey.properties.displayName"
      :surveyDate="survey.properties.surveyDate">
    </trk-summary-header>
    <trk-summary-category
      v-for="category in survey.nested"
      :key="category.properties.categoryId"
      :properties="category.properties"
      :nested="category.nested"
      :state="category.state">
    </trk-summary-category>
    <trk-summary-footer
      :onEdit="onEdit"
      :onDone="onDone">
    </trk-summary-footer>
    <trk-survey-debug-info v-if="isSurveyDebugAvailable"
      :surveyId="survey.properties.surveyId"
      :debugSurveyNested="debugSurveyNested"
      :debugSurveyProperties="debugSurveyProperties">
    </trk-survey-debug-info>
  </trk-page-base-layout>
</template>

<script lang="ts">
import TrkPageBaseLayout from "../components/TrkPageBaseLayout.vue";
import TrkSummaryCategory from "../components/TrkSummaryCategory.vue";
import TrkSummaryFooter from "../components/TrkSummaryFooter.vue";
import TrkSummaryHeader from "../components/TrkSummaryHeader.vue";
import TrkSurveyDebugInfo from "../components/TrkSurveyDebugInfo.vue";
import { useSurvey, useSurveyDebug } from "../composables/useSurvey";
import { defineComponent } from 'vue';
import { useLogger, VueLogger } from 'vue-logger-plugin';
import { Router, useRouter } from 'vue-router';
import { onIonViewWillEnter } from "@ionic/vue";

export default defineComponent({
  name: 'SummaryPage',
  components: {
    TrkPageBaseLayout,
    TrkSummaryCategory,
    TrkSummaryFooter,
    TrkSummaryHeader,
    TrkSurveyDebugInfo
  },
  setup() {
    const logger: VueLogger = useLogger();
    const router: Router = useRouter();
    const { survey, loadSurveyAsync } = useSurvey(logger);

    // TODO: This is just to show debugging information
    const { isSurveyDebugAvailable, debugSurveyNested, debugSurveyProperties } = useSurveyDebug();

    const onEdit = (): void => {
      // Allow users to move to another page now
      window.removeEventListener('beforeunload', preventAccidentReload);
      
      logger.debug(`survey.value.properties.surveyId = ${survey.value.properties.surveyId}`);
      router.push({name: 'SurveyPage', params: { surveyId: survey.value.properties.surveyId }});
    }

    const onDone = (): void => {
      // Allow users to move to another page now
      window.removeEventListener('beforeunload', preventAccidentReload);

      router.push({name: 'ThanksHomePage'});
    }

    onIonViewWillEnter(() => {
      logger.debug(`SummaryPage: onIonViewWillEnter: before loadSurveyAsync call`);
      loadSurveyAsync().then(() => {
        logger.debug(`SummaryPage: onIonViewWillEnter: after loadSurveyAsync resolved`);
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
      onDone,
      onEdit,
      isSurveyDebugAvailable,
      debugSurveyNested,
      debugSurveyProperties
    };
  },
});
</script>

<style scoped>
</style>
