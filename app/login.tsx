import { palette, shadow } from "@/constants/ui";
import { ApiError } from "@/services/api";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { login } from "../services/auth/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error) {
      console.log(error);
      setError(
        error instanceof ApiError
          ? error.message
          : "No se pudo iniciar sesión. Revisa tus datos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>Todo App</Text>
          <Text style={styles.subtitle}>
            Organiza tus listas, encuentra tareas y avanza sin perder el hilo.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar sesión</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="correo@tec.mx"
            placeholderTextColor={palette.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="********"
            placeholderTextColor={palette.muted}
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.button, loading && styles.buttonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: palette.primary,
    borderRadius: 16,
    padding: 15,
  },
  buttonDisabled: {
    backgroundColor: "#f9a8d4",
  },
  buttonText: {
    color: "white",
    fontWeight: "800",
    textAlign: "center",
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    ...shadow,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 18,
    textAlign: "center",
  },
  container: {
    alignSelf: "center",
    maxWidth: 430,
    width: "100%",
  },
  error: {
    color: palette.danger,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  hero: {
    alignItems: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fff7fb",
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    color: palette.ink,
    marginBottom: 14,
    padding: 13,
  },
  label: {
    color: palette.ink,
    fontWeight: "800",
    marginBottom: 7,
  },
  logo: {
    alignItems: "center",
    backgroundColor: palette.primary,
    borderRadius: 22,
    height: 66,
    justifyContent: "center",
    marginBottom: 16,
    width: 66,
    ...shadow,
  },
  screen: {
    backgroundColor: palette.background,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  title: {
    color: palette.ink,
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 8,
  },
});
