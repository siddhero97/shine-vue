import { useStore } from "@/store/adminStore";
import { RouteLocationNormalized, RouteLocationRaw } from "vue-router";

const checkAccessTokenNavigationGuard = async (to: RouteLocationNormalized):
  Promise<boolean | RouteLocationRaw> => {
  const canAccess: boolean = canUserAccess(to);

  if (canAccess)
    return true; // continue to the actual page
  else
    return { name: 'LoginPage' }; // force the user back to the login page
}

const canUserAccess = (to: RouteLocationNormalized): boolean => {
  if (to.name === 'LoginPage') { return true; }
  
  const { isAuthenticated } = useStore().methods;
  return isAuthenticated();
}

export {
  checkAccessTokenNavigationGuard,
}
