<template>
  <trk-page-base-layout class="accesskey">
    <template v-if="hasFailedAccessCheck">
      <p><strong>This survey link has expired or is invalid.</strong></p>
      <p>Please contact the administrator to get a replacement link.</p>
    </template>
    <template v-else>
      <p><strong>Verifying survey link...</strong></p>
    </template>
  </trk-page-base-layout>
</template>

<script lang="ts">
import TrkPageBaseLayout from "../components/TrkPageBaseLayout.vue";
import { defineComponent, ref, Ref } from 'vue';
import { useLogger, VueLogger } from 'vue-logger-plugin';
import { RouteLocationNormalizedLoaded, Router, useRoute, useRouter } from 'vue-router';
import { SurveyAccess } from '../interfaces/SurveyInterfaces';
import { authenticateSurveyAccessAsync } from '../providers/SurveyProvider';
import { useStore } from '../store/store';
import { onIonViewWillEnter } from "@ionic/vue";

export default defineComponent({
  name: 'AccessKeyTransientPage',
  components: {
    TrkPageBaseLayout
  },
  setup() {
    const logger: VueLogger = useLogger();
    const route: RouteLocationNormalizedLoaded = useRoute();
    const router: Router = useRouter();
    const accessKey: Ref<string> = ref(route.params.accessKey as string);
    const hasFailedAccessCheck: Ref<boolean> = ref(false);
    const store = useStore();
    const { getIsAuthenticated } = store.getters;
    const { clearState: clearStoreState, setAccessToken: setAccessTokenIntoStore } = store.methods;

    onIonViewWillEnter(() => {
      // TODO: Overall, we may not want the AccessKeyTransientPage at all - we would
      // probably end up working with Suspense and/or navigation guards

      // NOTE: Under successful circumstances, this page is transient, so the user
      //       may see it displayed temporarily before we redirect to the survey.
      //       If there is no survey for that key, we will consider the access check
      //       to have failed and the user will stay in this page, but with the
      //       failure message.
      hasFailedAccessCheck.value = false;

      // First, make sure clear existing app-wide store state.
      logger.debug(`AccessKeyTransientPage: onIonViewWillEnter: about to clear store state`);
      clearStoreState();
      logger.debug(`AccessKeyTransientPage: onIonViewWillEnter: store state was cleared`);

      // Use the access key to authenticate and access the survey (if valid). If
      // successful, app-wide state is updated with the access token that permits
      // subsequent access to survey API calls.
      authenticateSurveyAccessAsync(accessKey.value, logger).then((surveyAccess: SurveyAccess | null) => {
        if (surveyAccess) { // in other words, it's defined
          logger.debug(`AccessKeyTransientPage: onIonViewWillEnter - access key ${accessKey.value} maps to survey ID ${surveyAccess.surveyId}`);
          setAccessTokenIntoStore(surveyAccess.accessToken);
          if (getIsAuthenticated()) {
            logger.debug(`AccessKeyTransientPage: onIonViewWillEnter - redirecting to that survey...`);
            router.push({name: 'SurveyPage', params: { surveyId: surveyAccess.surveyId }})
          } else {
            logger.error(`AccessKeyTransientPage: onIonViewWillEnter - access key ${accessKey.value} isn't properly authenticated (invalid access token)`);
            hasFailedAccessCheck.value = true;
          }
        } else {
          logger.error(`AccessKeyTransientPage: onIonViewWillEnter - access key ${accessKey.value} is not mapped to any available survey`);
          hasFailedAccessCheck.value = true;
        }
      });
    });

    return {
      hasFailedAccessCheck,
    }
  },
});
</script>

<style scoped>
.accesskey {
  text-align: center;
}

.accesskey *:first-child {
  margin-top: 3rem;
}

.accesskey p {
  font-size: 16px;
  line-height: 22px;
}

.accesskey strong {
  font-size: 20px;
  line-height: 26px;
}
</style>
