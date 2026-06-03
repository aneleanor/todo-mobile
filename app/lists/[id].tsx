import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";

import { TaskItem } from "@/components/TaskItem/TaskItem";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { Alert, FlatList, Platform, StyleSheet, TextInput } from "react-native";

import { CreateButton } from "@/components/Button/ButtonCreate";
import { Pressable } from "@/components/ui/pressable";
import { palette, shadow } from "@/constants/ui";
import { ApiError } from "@/services/api";
import { deleteTodo, getTodos, updateTodo } from "@/services/todoService";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";


type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  listId?: string;
};

type Params = {
  id: string;
  title: string;
};


export default function TasksScreen() {
  const { id, title } = useLocalSearchParams<Params>();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const data = await getTodos();
      const currentListId = id as string;

      const mappedTasks: Task[] = data
        .filter((todo) => {
          const todoListId = todo.listId ?? todo.list?.id;
          return !todoListId || todoListId === currentListId;
        })
        .map((todo) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description,
          completed: todo.completed,
          dueDate: todo.dueDate,
          listId: todo.listId ?? todo.list?.id,
        }));

      setTasks(mappedTasks);
    } catch (error) {
      console.log(error);

      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
        return;
      }

      setError(
        error instanceof ApiError
          ? error.message
          : "No se pudieron cargar las tareas"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleToggle = async (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      return;
    }

    const completed = !task.completed;

    setTasks((prev) =>
      prev.map((item) =>
        item.id === taskId ? { ...item, completed } : item,
      ),
    );

    try {
      await updateTodo(taskId, {
        completed,
        listId: id as string,
      });
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        error instanceof ApiError ? error.message : "No se pudo actualizar la tarea."
      );
      await loadTasks();
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskDueDate(task.dueDate ? new Date(task.dueDate) : new Date());
  };

  const saveTask = async () => {
    if (!editingTask || !taskTitle.trim()) {
      return;
    }

    try {
      await updateTodo(editingTask.id, {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        completed: editingTask.completed,
        dueDate: taskDueDate.toISOString(),
        listId: id as string,
      });
      setEditingTask(null);
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate(new Date());
      await loadTasks();
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        error instanceof ApiError ? error.message : "No se pudo guardar la tarea."
      );
    }
  };

  const confirmDelete = (taskId: string) => {
    Alert.alert(
      "Eliminar tarea",
      "¿Quieres eliminar esta tarea?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTodo(taskId);
              setTasks((prev) => prev.filter((task) => task.id !== taskId));
            } catch (error) {
              console.log(error);
              Alert.alert(
                "Error",
                error instanceof ApiError ? error.message : "No se pudo eliminar la tarea."
              );
            }
          },
        },
        
      ]
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const percentage =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);
  const formattedEditDate = taskDueDate.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const editDateInputValue = taskDueDate.toISOString().slice(0, 10);

  return (
    <>
      <Stack.Screen
        options={{
          title: title ?? "Detalle de lista",
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <Box style={styles.screen}>
        <Box style={styles.hero}>
          <Box style={styles.heroIcon}>
            <Ionicons name="heart-outline" size={22} color="white" />
          </Box>

          <Text style={styles.heroEyebrow}>
            DETALLE DE LISTA
          </Text>

          <Text style={styles.heroTitle}>
            {title ?? "Detalle de lista"}
          </Text>

          <Text style={styles.heroSubtitle}>
            {completedCount} de {tasks.length} tareas completadas
          </Text>

          <Progress value={percentage}>
            <ProgressFilledTrack />
          </Progress>

          <Text style={styles.heroProgressText}>
            {percentage}% completado
          </Text>
        </Box>

        <Box style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            TAREAS
          </Text>

          <Box style={styles.pendingPill}>
            <Text style={styles.pendingText}>
              {tasks.length - completedCount} pendientes
            </Text>
          </Box>
        </Box>

        {loading && (
          <Box style={styles.feedbackCard}>
            <Spinner size="large" color={palette.primary} />
            <Text style={styles.feedbackText}>Cargando tareas...</Text>
          </Box>
        )}

        {!loading && error && (
          <Box style={styles.feedbackCard}>
            <Ionicons name="alert-circle-outline" size={28} color={palette.danger} />
            <Text style={styles.feedbackTitle}>No se pudieron cargar</Text>
            <Text style={styles.feedbackText}>{error}</Text>
            <Pressable onPress={loadTasks} style={[styles.formButton, styles.primaryButton]}>
              <Text style={styles.primaryButtonText}>Reintentar</Text>
            </Pressable>
          </Box>
        )}

        {!loading && !error && tasks.length === 0 && (
          <Box style={styles.feedbackCard}>
            <Box style={styles.emptyIcon}>
              <Ionicons name="calendar-outline" size={26} color={palette.primary} />
            </Box>
            <Text style={styles.feedbackTitle}>
              Esta lista no tiene tareas
            </Text>
            <Text style={styles.feedbackText}>
              Agrega una tarea con el botón inferior.
            </Text>
          </Box>
        )}

        {editingTask && (
          <Box style={styles.editCard}>
            <Box style={styles.editHeader}>
              <Ionicons name="create-outline" size={18} color={palette.primary} />
              <Text style={styles.editTitle}>Editar tarea</Text>
            </Box>

            <TextInput
              placeholder="Título"
              placeholderTextColor={palette.muted}
              value={taskTitle}
              onChangeText={setTaskTitle}
              style={styles.input}
            />

            <TextInput
              placeholder="Descripción"
              placeholderTextColor={palette.muted}
              value={taskDescription}
              onChangeText={setTaskDescription}
              multiline
              style={[styles.input, styles.textArea]}
            />

            {Platform.OS === "web" ? (
              <Box style={styles.webDateRow}>
                <Ionicons name="calendar-outline" size={18} color={palette.primary} />
                {React.createElement("input", {
                  type: "date",
                  value: editDateInputValue,
                  onChange: (event: { target: { value: string } }) => {
                    if (event.target.value) {
                      setTaskDueDate(new Date(`${event.target.value}T12:00:00`));
                    }
                  },
                  style: StyleSheet.flatten([styles.input, styles.webDateInput]),
                })}
              </Box>
            ) : (
              <Pressable
                onPress={() => setShowEditDatePicker(true)}
                style={styles.dateButton}
              >
                <Ionicons name="calendar-outline" size={18} color={palette.primary} />
                <Text style={styles.dateButtonText}>{formattedEditDate}</Text>
              </Pressable>
            )}

            {showEditDatePicker && Platform.OS !== "web" && (
              <DateTimePicker
                value={taskDueDate}
                mode="date"
                display="default"
                onChange={(_, selectedDate) => {
                  setShowEditDatePicker(false);

                  if (selectedDate) {
                    setTaskDueDate(selectedDate);
                  }
                }}
              />
            )}

            <Box style={styles.formActions}>
              <Pressable
                onPress={saveTask}
                style={[styles.formButton, styles.primaryButton]}
              >
                <Text style={styles.primaryButtonText}>Guardar</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setEditingTask(null);
                  setShowEditDatePicker(false);
                }}
                style={[styles.formButton, styles.secondaryButton]}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </Pressable>
            </Box>
          </Box>
        )}

        {!loading && !error && (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onToggle={handleToggle}
                onEdit={startEdit}
                onDelete={confirmDelete}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}

        <CreateButton
          label="+"
          onPress={() =>
            router.push({
              pathname: "/modal",
              params: {
                listId: id,
                listTitle: title ?? "Detalle de lista",
              },
            })
          }
          style={styles.floatingButton}
        />
      </Box>
    </>
  );
}

const styles = StyleSheet.create({
  dateButton: {
    alignItems: "center",
    backgroundColor: "#fff7fb",
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    padding: 13,
  },
  dateButtonText: {
    color: palette.ink,
    fontWeight: "800",
  },
editCard: {
  position: "absolute",
  top: 140,
  left: 20,
  right: 20,

  zIndex: 9999,

  backgroundColor: palette.surface,
  borderColor: palette.border,
  borderRadius: 18,
  borderWidth: 1,
  padding: 20,

  ...shadow,
},
  editHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  editTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: palette.primarySoft,
    borderRadius: 18,
    height: 48,
    justifyContent: "center",
    marginBottom: 12,
    width: 48,
  },
  feedbackCard: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    maxHeight: 210,
    minHeight: 170,
    padding: 24,
    ...shadow,
  },
  feedbackText: {
    color: palette.muted,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },
  feedbackTitle: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 8,
  },
  floatingButton: {
    borderRadius: 30,
    bottom: 20,
    height: 60,
    position: "absolute",
    right: 20,
    width: 60,
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
  },
  formButton: {
    alignItems: "center",
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  hero: {
    backgroundColor: palette.primaryDark,
    borderRadius: 24,
    marginBottom: 20,
    padding: 20,
    ...shadow,
  },
  heroEyebrow: {
    color: "#ffd6e7",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 14,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  heroProgressText: {
    color: "white",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 9,
  },
  heroSubtitle: {
    color: "#ffd6e7",
    fontSize: 14,
    marginBottom: 16,
  },
  heroTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#fff7fb",
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    color: palette.ink,
    marginBottom: 10,
    padding: 13,
  },
  listContent: {
    paddingBottom: 92,
  },
  pendingPill: {
    backgroundColor: palette.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pendingText: {
    color: palette.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  primaryButton: {
    backgroundColor: palette.primary,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "900",
    textAlign: "center",
  },
  screen: {
    backgroundColor: palette.background,
    flex: 1,
    padding: 16,
  },
  secondaryButton: {
    backgroundColor: palette.primarySoft,
  },
  secondaryButtonText: {
    color: palette.primaryDark,
    fontWeight: "800",
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  textArea: {
    minHeight: 78,
    textAlignVertical: "top",
  },
  webDateInput: {
    flex: 1,
    marginBottom: 0,
  },
  webDateRow: {
    alignItems: "center",
    backgroundColor: "#fff7fb",
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
    paddingHorizontal: 13,
  },
});
