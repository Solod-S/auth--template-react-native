import { createContext, useContext, useEffect, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db, firebaseConfig } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { makeRedirectUri } from "expo-auth-session";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, seIsAuthenticated] = useState(undefined);

  // responsible for tracking changes in the user's authorization state
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, user => {
      try {
        // console.log("Auth state changed for:", user?.email);
        if (user) {
          seIsAuthenticated(true);
          setUser(user);
          updateUserData(user.uid);
        } else {
          seIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.log(`error in unSub`, error);
        seIsAuthenticated(false);
        setUser(null);
      }
    });

    return unSub;
  }, []);

  const updateUserData = async id => {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let data = docSnap.data();
      setUser({
        ...user,
        username: data.username,
        profileUrl: data.profileUrl,
        userId: data.userId,
      });
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.log(`Error login`, error);
      let msg = error.message || "An error occurred";
      if (msg.includes("invalid-email")) msg = "Invalid email";
      if (msg.includes("auth/invalid-credential"))
        msg = "Invalid email or password";
      return { success: false, message: msg };
    }
  };

  const [request, response, promptAsync] = Google.useAuthRequest({
    ...firebaseConfig,
  });

  const loginWithGoogle = async () => {
    try {
      const result = await promptAsync();
      console.log(`result`, result);
      if (result.type === "success") {
        const { id_token } = result.authentication;
        console.log(`id_token`, id_token);
        const credential = GoogleAuthProvider.credential(id_token);
        await signInWithCredential(auth, credential);
        return { success: true };
      }
      return { success: false, message: "Google sign-in canceled" };
    } catch (error) {
      console.error("Google sign-in error", error);
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.log(`Error logout`, error);
      return {
        success: false,
        message: msg
          .replace("FirebaseError: ", "")
          .replace("Firebase: ", "")
          .replace("auth/", "")
          .replace(/-/g, " "),
      };
    }
  };

  const register = async (email, password, username, profileUrl) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // No need to do this because we use unSub in useEffect.
      // seIsAuthenticated(response?.user);
      // setUser(user);

      await setDoc(doc(db, "users", response?.user?.uid), {
        username,
        profileUrl,
        userId: response?.user?.uid,
      });
      return { success: true, data: response?.user };
    } catch (error) {
      console.log(`Error register`, error);
      let msg = error.message;
      if (msg.includes("invalid-emai")) msg = "Invalid email";
      if (msg.includes("email-already-in-use")) msg = "Email already in use";

      return {
        success: false,
        message: msg
          .replace("FirebaseError: ", "")
          .replace("Firebase: ", "")
          .replace("auth/", "")
          .replace(/-/g, " "),
      };
    }
  };

  const resetPassword = async email => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, data: response?.user };
    } catch (error) {
      console.log(`Error in resetPassword:`, error);
      let msg = error.message;
      if (msg.includes("invalid-email")) msg = "Invalid email";
      if (msg.includes("user-not-found")) msg = "User not found";

      return {
        success: false,
        message: msg
          .replace("FirebaseError: ", "")
          .replace("Firebase: ", "")
          .replace("auth/", "")
          .replace(/-/g, " "),
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be wrapped inside AuthContextProvider");
  }
  return value;
};
