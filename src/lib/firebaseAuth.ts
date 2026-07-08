import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signInWithCredential } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

declare global {
  interface Window {
    google?: any;
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Sheets & Drive scopes to read/write spreadsheets and files
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// Keep track of the login state and cache the access token in memory
let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Helper to dynamically load GSI script
const loadGsiScript = (): Promise<any> => {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve(window.google);
    };
    script.onerror = () => {
      resolve(null);
    };
    document.head.appendChild(script);
  });
};

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;

    // Check if inside an iframe or if third-party cookies might be blocked
    const isInIframe = window.self !== window.top;

    if (isInIframe) {
      console.log('Detected running in an iframe. Using Google Identity Services (GSI) Token Client to bypass third-party cookie restrictions.');
      await loadGsiScript();
      if (window.google?.accounts?.oauth2) {
        return new Promise((resolve, reject) => {
          try {
            const client = window.google.accounts.oauth2.initTokenClient({
              client_id: firebaseConfig.oAuthClientId,
              scope: 'openid email profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
              callback: async (response: any) => {
                if (response.error) {
                  reject(new Error(response.error_description || response.error));
                  return;
                }
                if (!response.access_token) {
                  reject(new Error('No access token returned from Google Identity Services.'));
                  return;
                }
                try {
                  const credential = GoogleAuthProvider.credential(null, response.access_token);
                  const userCredential = await signInWithCredential(auth, credential);
                  cachedAccessToken = response.access_token;
                  resolve({ user: userCredential.user, accessToken: cachedAccessToken });
                } catch (err) {
                  reject(err);
                }
              },
              error_callback: (err: any) => {
                reject(err);
              }
            });
            client.requestAccessToken({ prompt: 'consent' });
          } catch (err) {
            reject(err);
          }
        });
      } else {
        console.warn('GSI SDK could not be loaded. Falling back to standard Firebase signInWithPopup.');
      }
    }

    // Standard Fallback / Non-iframe flow
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Sign-In credential.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
