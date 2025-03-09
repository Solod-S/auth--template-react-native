import { makeAutoObservable, runInAction } from "mobx";
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

class AuthStore {
  user = null;
  isAuthenticated = undefined;

  constructor() {
    makeAutoObservable(this);
    this.initAuthListener();
  }

  // Wrap this in an action to avoid strict mode issues
  setUser(user) {
    this.user = user;
  }

  setIsAuthenticated(isAuthenticated) {
    this.isAuthenticated = isAuthenticated;
  }

  async updateUserData(id) {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      runInAction(() => {
        this.user = {
          ...this.user,
          email: data.email,
          fullName: data.fullName,
          userId: data.userId,
        };
      });
    }
  }

  // Use action for state updates inside async methods
  async login(email, password) {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      const { user } = response;
      runInAction(() => {
        this.user = user;
        this.isAuthenticated = true;
      });

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
  }

  // Use action for state updates inside async methods
  async logout() {
    try {
      await signOut(auth);
      runInAction(() => {
        this.user = null;
        this.isAuthenticated = false;
      });
    } catch (error) {
      runInAction(() => {
        this.user = null;
        this.isAuthenticated = false;
      });
      console.log("Error logout:", error);
    }
  }

  // Use action for state updates inside async methods
  async register(email, password, fullName) {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const { user } = response;
      await sendEmailVerification(user);
      await setDoc(doc(db, "users", user.uid), {
        email,
        fullName,
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
      return { success: true, data: user };
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
    }
  }

  // Use action for state updates inside async methods
  async resetPassword(email) {
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
      console.log("Error in resetPassword:", error);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Failed",
        text2: error.message,
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 50,
      });
    }
  }

  // Wrap this in action to avoid strict mode issues
  initAuthListener() {
    this.isAuthenticated = undefined;
    const unsubscribe = onAuthStateChanged(auth, async user => {
      runInAction(() => {
        if (user) {
          this.user = user;
          this.isAuthenticated = true;
          this.updateUserData(user.uid);
        } else {
          this.user = null;
          this.isAuthenticated = false;
        }
      });
    });

    return unsubscribe;
  }
}

const authStore = new AuthStore();
export default authStore;
