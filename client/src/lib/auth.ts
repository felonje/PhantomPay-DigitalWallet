import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    console.log('Attempting Google sign-in with popup...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign-in successful:', result.user);
    return result;
  } catch (error: any) {
    console.error('Google sign-in popup error:', error);
    
    // If popup fails due to domain issues, try redirect method
    if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/popup-blocked') {
      console.log('Popup failed, trying redirect method...');
      try {
        await signInWithRedirect(auth, googleProvider);
        // Redirect will handle the auth, no return needed
      } catch (redirectError) {
        console.error('Google redirect sign-in error:', redirectError);
        throw redirectError;
      }
    } else {
      throw error;
    }
  }
};

// Handle redirect result on page load
export const handleAuthRedirect = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('Redirect sign-in successful:', result.user);
      return result;
    }
  } catch (error) {
    console.error('Redirect result error:', error);
    throw error;
  }
  return null;
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log('Attempting email sign-in for:', email);
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Email sign-in successful:', result.user);
    return result;
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    console.log('Attempting email sign-up for:', email);
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Email sign-up successful:', result.user);
    return result;
  } catch (error) {
    console.error('Email sign-up error:', error);
    throw error;
  }
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getAuthToken = async () => {
  const user = getCurrentUser();
  if (user) {
    return await user.getIdToken();
  }
  return null;
};
