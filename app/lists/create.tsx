import { palette, shadow } from "@/constants/ui";
import { createList } from "@/services/listService";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

export default function CreateListScreen() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await createList(name.trim());
      router.back();
    } catch (error) {
      console.log(error);
      setError("No se pudo crear la lista.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: palette.background }}>
      <Stack.Screen options={{ title: "Nueva lista" }} />

      <Text style={{ color: palette.ink, fontSize: 28, fontWeight: "900", marginBottom: 8 }}>
        Crear lista
      </Text>
      <Text style={{ color: palette.muted, lineHeight: 20, marginBottom: 20 }}>
        Organiza tus tareas por materia, proyecto o prioridad.
      </Text>

      <View
        style={{
          backgroundColor: palette.surface,
          borderColor: palette.border,
          borderRadius: 16,
          borderWidth: 1,
          padding: 16,
          ...shadow,
        }}
      >
        <Text style={{ color: palette.ink, fontWeight: "800", marginBottom: 8 }}>
          Nombre
        </Text>
        <TextInput
          placeholder="Nombre de la lista"
          value={name}
          onChangeText={setName}
          style={{
            backgroundColor: "#f8fafc",
            borderColor: palette.border,
            borderRadius: 12,
            borderWidth: 1,
            marginBottom: 12,
            padding: 12,
          }}
        />

        {error ? <Text style={{ color: palette.danger, marginBottom: 12 }}>{error}</Text> : null}

        <Pressable
          onPress={handleCreate}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#93c5fd" : palette.primary,
            borderRadius: 12,
            padding: 15,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "800", textAlign: "center" }}>
              Crear lista
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
