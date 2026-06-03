import { palette, shadow } from "@/constants/ui";
import { auth } from "@/services/auth/auth";
import { logout } from "@/services/auth/authService";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen() {
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      router.replace("/login");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo cerrar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ color: palette.ink, fontSize: 28, fontWeight: "900", marginBottom: 8 }}>
          Perfil
        </Text>
        <Text style={{ color: palette.muted, marginBottom: 24 }}>
          Información de la sesión actual
        </Text>

        <View
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.border,
            borderRadius: 16,
            borderWidth: 1,
            marginBottom: 20,
            padding: 16,
            ...shadow,
          }}
        >
          <Text style={{ color: palette.muted, fontSize: 12, fontWeight: "800", marginBottom: 4 }}>
            Correo
          </Text>
          <Text style={{ color: palette.ink, fontSize: 18, fontWeight: "800", marginBottom: 16 }}>
            {user?.email ?? "Usuario autenticado"}
          </Text>

          <Text style={{ color: palette.muted, fontSize: 12, fontWeight: "800", marginBottom: 4 }}>
            UID
          </Text>
          <Text style={{ color: "#334155" }}>
            {user?.uid ?? "No disponible"}
          </Text>
        </View>

        <Pressable
          onPress={handleLogout}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#fca5a5" : "#dc2626",
            borderRadius: 12,
            padding: 15,
            ...shadow,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "800", textAlign: "center" }}>
              Cerrar sesión
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
