import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./auth";

export const login = async (
  email: string,
  password: string
) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  console.log("UID:", userCredential.user.uid);
  console.log("EMAIL:", userCredential.user.email);
  const token = await userCredential.user.getIdToken();

  await AsyncStorage.setItem("token", token);

  return token;
};

export const logout = async () => {
  await signOut(auth);
  await AsyncStorage.removeItem("token");
};
