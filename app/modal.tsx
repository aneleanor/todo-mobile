import { createTodo } from "@/services/todoService";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";


export default function ModalScreen() {
  const { listId } = useLocalSearchParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleCreate = async () => {
    try {
      console.log("LIST ID:", listId);

      const response = await createTodo(
        title,
        description,
        dueDate.toISOString(),
        listId as string
      );

      console.log("SUCCESS:", response);

      router.replace({
      pathname: "/lists/[id]",
      params: {
        id: listId as string,
      },
    });
    } catch (error: any) {
      console.log("ERROR:", error);
      console.log("RESPONSE:", error?.response?.data);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginBottom: 20,
        }}
      >
        Nueva tarea
      </Text>

      <TextInput
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 10,
          padding: 12,
          marginBottom: 15,
        }}
      />

      <TextInput
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 10,
          padding: 12,
          marginBottom: 15,
        }}
      />

      <Text
  style={{
    fontWeight: "600",
    marginBottom: 8,
  }}
>
  Fecha límite
</Text>

<Pressable
  onPress={() => setShowPicker(true)}
  style={{
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  }}
>
      <Text>
        {dueDate.toLocaleDateString()}
      </Text>
    </Pressable>

    {showPicker && (
      <DateTimePicker
        value={dueDate}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          setShowPicker(false);

          if (selectedDate) {
            setDueDate(selectedDate);
          }
        }}
      />
    )}

      <Pressable
        onPress={handleCreate}
        style={{
          backgroundColor: "#2563eb",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Crear tarea
        </Text>
      </Pressable>
    </View>
  );
}