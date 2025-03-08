import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

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

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.log(`Error logout`, error);
      return { success: false, message: msg };
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

      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, register, logout }}
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
