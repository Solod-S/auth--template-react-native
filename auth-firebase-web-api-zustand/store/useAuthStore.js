import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";

const useAuthStore = create(set => ({
  user: null,
  isAuthenticated: undefined,

  setUser: user => set({ user }),
  setIsAuthenticated: isAuthenticated => set({ isAuthenticated }),

  updateUserData: async id => {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      set(state => ({
        user: {
          ...state.user,
          email: data.email,
          username: data.username,
          profileUrl: data.profileUrl,
          userId: data.userId,
        },
      }));
    }
  },

  login: async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      const { user } = response;

      set({ user, isAuthenticated: true });
      return { success: true, data: user };
    } catch (error) {
      console.log("Error login:", error);
      let msg = error.message || "An error occurred";
      if (msg.includes("invalid-email")) msg = "Invalid email";
      if (msg.includes("auth/invalid-credential"))
        msg = "Invalid email or password";
      return {
        success: false,
        message: msg
          .replace("FirebaseError: ", "")
          .replace("Firebase: ", "")
          .replace("auth/", "")
          .replace(/-/g, " "),
      };
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, isAuthenticated: false });
      return { success: true };
    } catch (error) {
      console.log("Error logout:", error);
      set({ user: null, isAuthenticated: false });
    }
  },

  register: async (email, password, username, profileUrl) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { user } = response;
      await setDoc(doc(db, "users", user.uid), {
        email,
        username,
        profileUrl,
        userId: user.uid,
        lastGeneratedAt: null,
      });
      Toast.show({
        type: "success",
        position: "top",
        text1: "Success",
        text2: "Account activation email sent",
        visibilityTime: 5000,
        autoHide: true,
        topOffset: 50,
      });
      return { success: true, data: response.user };
    } catch (error) {
      console.log("Error register:", error);
      let msg = error.message;
      if (msg.includes("invalid-email")) msg = "Invalid email";
      if (msg.includes("email-already-in-use")) msg = "Email already in use";
      return {
        success: false,
        message: msg
          .replace("FirebaseError: ", "")
          .replace("Firebase: ", "")
          .replace("auth/", "")
          .replace(/-/g, " "),
      };
      // throw error;
    }
  },

  resetPassword: async email => {
    try {
      await sendPasswordResetEmail(auth, email);
      Toast.show({
        type: "success",
        position: "top",
        text1: "Success",
        text2: "Password reset email sent",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 50,
      });
      return { success: true };
    } catch (error) {
      console.log(`Error in resetPassword:`, error);
      let msg = error.message;
      if (msg.includes("invalid-email")) msg = "Invalid email";
      if (msg.includes("user-not-found")) msg = "User not found";
      Toast.show({
        type: "error",
        position: "top",
        text1: "Failed",
        text2: msg
          .replace("FirebaseError: ", "")
          .replace("Firebase: ", "")
          .replace("auth/", "")
          .replace(/-/g, " "),
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 50,
      });
      return { success: false };
    }
  },

  initAuthListener: () => {
    set({ isAuthenticated: undefined }); // Устанавливаем состояние в неопределённое
    const unsubscribe = onAuthStateChanged(auth, async user => {
      // console.log("onAuthStateChanged triggered", user); // Логируем пользователя
      if (user) {
        set({ user, isAuthenticated: true });
        await useAuthStore.getState().updateUserData(user.uid); // Загружаем доп. данные пользователя
      } else {
        set({ user: null, isAuthenticated: false });
      }
    });
    return unsubscribe;
  },
}));

export default useAuthStore;
