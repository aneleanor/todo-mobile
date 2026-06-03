import "@/global.css";
import "react-native-reanimated";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();

  useEffect(() => {
    const checkSession = async () => {
      const token = await AsyncStorage.getItem("token");
      const currentRoute = segments[0];
      const isLogin = currentRoute === "login";

      if (!token && !isLogin) {
        router.replace("/login");
      }
    };

    checkSession();
  }, [segments]);

  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="login">
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="lists/create" options={{ title: "Nueva lista" }} />
          <Stack.Screen name="lists/[id]" options={{ title: "Detalle de lista" }} />
          <Stack.Screen
            name="modal"
            options={{ title: "Nueva tarea" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
