import { useSession } from "@/composables/useSession";
import { Router } from "vue-router";

export interface UseAuthenticatedNavLogicPublic {
  goToAsync: (routeName: string) => Promise<void>;
  logoutAsync: () => Promise<void>;
  goToLoggedInUserEditPage: () => Promise<void>;
}

export const useAuthenticatedNavLogic = (router: Router): UseAuthenticatedNavLogicPublic => {
  const session = useSession();

  /**
   * Navigates to the specified route using the route's name.
   * 
   * @async
   * @returns A Promise with a void return "value".
   */
  const goToAsync = async (routeName: string): Promise<void> => {
    await router.push({ name: routeName });
  }

  /**
   * Logs the user out and sends the user back to the login page.
   * 
   * @async
   * @returns A promise witha void return "value".
   */
  const logoutAsync = async (): Promise<void> => {
    // Whether the logout actually worked or not on the server, we need to just go
    // back to the login page once we've logged out of the session.
    await session.logoutAsync();
    await goToAsync('LoginPage');
  }

  /**
   * Navigates to the User Profile page of the currently logged in user
   * 
   * @async
   * @returns A Promise with a void return "value".
   */
  const goToLoggedInUserEditPage = async (): Promise<void> => {
    await router.push({ name: 'UserEditPage', params: { entityId: session.session.value.userId } });
  }
  
  return {
    goToAsync,
    logoutAsync,
    goToLoggedInUserEditPage,
  };
};
