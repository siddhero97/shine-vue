/***
 * store.ts
 *
 * Shared state within the user app instance (one user in one browser tab)
 */
import { Category, CategoryAttributes } from '@/interfaces/CategoryInterfaces';
import { Question, QuestionAttributes } from '@/interfaces/QuestionInterfaces';
import { Session } from '@/interfaces/SessionInterfaces';
import { User, UserAttributes } from '@/interfaces/UserInterfaces'
import { ref, Ref } from 'vue';

/* ---
 * HELPERS (private to this module)
 * ---
 */

const createEmptyUserAttributes = (): UserAttributes => {
  return {
    id: 0,
    password: '',
    confirmPassword: '',
    oldPassword: '',
    displayName: '',
    mobilePhone: '',
    categories: [],
    notifications: [],
    email: '',
    createdAt: null,
    updatedAt: null,
  };
}

const createEmptyUser = (): User => {
  return {
    state: createEmptyUserAttributes(),
  }
}


/**
 * Categories
 * @returns CategoryAttributes
 */
const createEmptyCategoryAttributes = (): CategoryAttributes => {
  return {
    id: 0,
    description: '',
    order: 0,
    createdAt: null,
    updatedAt: null,
  };
}

const createEmptyCategory = (): Category => {
  return {
    state: createEmptyCategoryAttributes(),
  }
}


/**
 * Question
 * @returns QuestionAttributes
 */
const createEmptyQuestionAttributes = (): QuestionAttributes => {
  return {
    id: 0,
    categoryId: 0,
    order: 0,
    answerType: '',
    questionPrompt: '',
    options: '',
    validations: '',
    createdAt: null,
    updatedAt: null,
  };
}

const createEmptyQuestion = (): Question => {
  return {
    state: createEmptyQuestionAttributes(),
  }
}

/**
 * Create an empty session
 * 
 * @returns Session an empty session
 */
const createEmptySession = (): Session => {
  return {
    userId: 0,
    userDisplayName: '',
    role: '',
  }
}

/**
 * Singleton state: whether or not the user is loaded (from the server)
 */
// const isLoaded: Ref<boolean> = ref(false);

/**
 * Singleton state: reactive user ID
 */
const userId: Ref<number> = ref(0);

/**
 * Singleton state: reactive user object (initialized as minimal
 * object to satisfy TS)
 *
 * TODO: Should it be here? Do we need to "store it"?
 */
const user: Ref<User> = ref(createEmptyUser());

/**
 * Singleton state: reactive category object (initialized as minimal
 * object to satisfy TS)
 * 
 * List of categories to associate with users upon submit. Currently 
 *   here for convient access (vs making it an argument to `submitUserAsync()`
 *   in `composables/useUser()`)
 *
 * TODO: Should this list be here?
 */
const categoryList: Ref<CategoryAttributes[]> = ref([]);

/**
 * Singleton state: reactive user ID
 */
const categoryId: Ref<number> = ref(0);

/**
 * Singleton state: reactive category object (initialized as minimal
 * object to satisfy TS)
 *
 * TODO: Should it be here? Do we need to "store it"?
 */
const category: Ref<Category> = ref(createEmptyCategory());

/**
 * Singleton state: reactive user ID
 */
const questionId: Ref<number> = ref(0);

/**
 * Singleton state: reactive category object (initialized as minimal
 * object to satisfy TS)
 *
 * TODO: Should it be here? Do we need to "store it"?
 */
const question: Ref<Question> = ref(createEmptyQuestion());

/**
 * The JWT token returned from server, for the session, with an expiry date
 */
const accessToken: Ref<string> = ref('');

/**
 * The JWT token returned from server, for the session, with NO expiry
 */
const refreshToken: Ref<string> = ref('');


/**
 * The user Id of the logged in user
 * 
 * @TODO should the `store.state.accessToken` & `store.state.refreshToken` be in `store.state.session`?
 */
const session: Ref<Session> = ref(createEmptySession());


/*
 * The interface for the admin store, used when parsing the local storage
 *
 * Unnecessary for now
 * /
interface AdminStoreInterface {
  state: AdminStoreStateInterface,
  methods: any,
  // methods: {
  //   clearState(): void,
  //   getAccessToken(): string,
  //   isAuthenticated(): boolean,
  //   clearSession(): void,
  // }
}
interface AdminStoreStateInterface {
  userId: Ref<number>,
  user: Ref<User>,

  categoryList: Ref<CategoryAttributes[]>,
  categoryId: Ref<number>,
  category: Ref<Category>,

  questionId: Ref<number>,
  question: Ref<Question>,

  accessToken: Ref<string>,
  refreshToken: Ref<string>,

  session: Ref<Session>,
}
*/

/**
 * The underlying combined shared state.
 * 
 * @TODO Do we really need userId, categoryId, and questionId
 */
const store = {
  state: {
    userId,
    user,
    categoryList,

    categoryId,
    category,

    questionId,
    question,

    accessToken,
    refreshToken,
    session,
  },
  methods: {
    clearState(): void {
      userId.value = 0;
      user.value = createEmptyUser();
      categoryList.value = [];

      categoryId.value = 0;
      category.value = createEmptyCategory();

      questionId.value = 0;
      question.value = createEmptyQuestion();
    },
    getAccessToken(): string {
      return store.state.accessToken.value;
    },
    isAuthenticated(): boolean {
      // const { isAuthenticated } = useSession(); // @TODO only load isAuthenticated()?
      // return useSession().isAuthenticated(); // @TODO this results in circular dependencies
      console.log(`Authenicating access token: ${store.methods.getAccessToken()}`);
      return store.methods.getAccessToken().length > 0;
    },
    clearSession(): void {
      store.state.accessToken.value = '';
      store.state.refreshToken.value = '';
      store.state.session.value = createEmptySession();
    },
    getSessionFromLocalStorage(): void {
      // Store the state in local storage
      if (localStorage.getItem(store.LOCALSTORAGE_SESSION_KEY) !== null) {
        const partialState = JSON.parse(localStorage.getItem(store.LOCALSTORAGE_SESSION_KEY) as string);
        store.state.accessToken.value = partialState.accessToken;
        store.state.refreshToken.value = partialState.refreshToken;
        store.state.session.value = partialState.session;
      }
    },
    storeSessionInLocalStorage(): void {
      // Clear the state: just store the accesstoken + refreshtoken
      localStorage.setItem(store.LOCALSTORAGE_SESSION_KEY, JSON.stringify({
        accessToken: store.state.accessToken.value,
        refreshToken: store.state.refreshToken.value,
        session: store.state.session.value,
      }));
    }
  },
  LOCALSTORAGE_SESSION_KEY: 'metrics_admin_store',
};

// Load the session for storage
store.methods.getSessionFromLocalStorage();

// Store the session in storage
window.addEventListener('beforeunload', () => {
  store.methods.storeSessionInLocalStorage();
});

/* ---
 * EXPORTS
 * ---
 */

/**
 * EXPORT: useStore - returns the store for shared state
 */

// eslint-disable-next-line
export const useStore = () => {
  return store;
}
