import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TaskListCard from "@/components/TaskListCard/TaskListCard";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";

import { deleteList, getLists, updateList } from "@/services/listService";
import { deleteTodo, getTodos } from "@/services/todoService";
import { TaskList } from "@/types/TaskList";

import { CreateButton } from "@/components/Button/ButtonCreate";
import { palette, shadow } from "@/constants/ui";
import { ApiError } from "@/services/api";
import { confirmDestructiveAction } from "@/utils/confirmDestructiveAction";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

export default function HomeScreen() {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingList, setEditingList] = useState<TaskList | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingListId, setDeletingListId] = useState<string | null>(null);

  const loadLists = useCallback(async () => {
    try {
      setError(null);

      const data = await getLists();

      const mappedLists: TaskList[] = data.map((list) => ({
        id: list.id,
        title: list.name,
        subtitle: "Todo List",
        percentage: 0,
        tags: [],
        idColor: "bg-blue-500",
        idIcon: "list",
      }));

      setLists(mappedLists);
    } catch (error) {
      console.log(error);

      if (error instanceof ApiError && error.status === 401) {
        router.replace("/login");
        return;
      }

      setError(
        error instanceof ApiError
          ? error.message
          : "No se pudieron cargar las listas"
      );
      setLists([]);
    }
    
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setLoading(true);
      loadLists().finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

      return () => {
        isActive = false;
      };
    }, [loadLists])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLists();
    setRefreshing(false);
  };

  const startEdit = (list: TaskList) => {
    setEditingList(list);
    setEditingName(list.title);
  };

  const saveEdit = async () => {
    if (!editingList || !editingName.trim()) {
      return;
    }

    try {
      await updateList(editingList.id, editingName.trim());
      setEditingList(null);
      setEditingName("");
      await loadLists();
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Error",
        error instanceof ApiError ? error.message : "No se pudo actualizar la lista."
      );
    }
  };

  const confirmDelete = (list: TaskList) => {
    confirmDestructiveAction({
      title: "Eliminar lista",
      message: `¿Quieres eliminar "${list.title}"?`,
      onConfirm: async () => {
        try {
          setDeletingListId(list.id);
          const todos = await getTodos();
          const todosFromList = todos.filter((todo) => {
            const todoListId = todo.listId ?? todo.list?.id;
            return todoListId === list.id;
          });

          await Promise.all(
            todosFromList.map((todo) => deleteTodo(todo.id))
          );
          await deleteList(list.id);
          setLists((prev) => prev.filter((item) => item.id !== list.id));
        } catch (error) {
          console.log(error);
          Alert.alert(
            "Error",
            error instanceof ApiError ? error.message : "No se pudo eliminar la lista."
          );
        } finally {
          setDeletingListId(null);
        }
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <Box style={styles.screen}>
        <Box style={styles.hero}>
          <Box style={styles.heroIcon}>
            <Ionicons name="calendar-clear-outline" size={22} color="white" />
          </Box>
          <Text style={styles.heroEyebrow}>Mis listas</Text>
          <Text style={styles.heroTitle}>Inicio</Text>
          <Text style={styles.heroSubtitle}>
            {lists.length} listas activas para organizar tu día
          </Text>
          <Box style={styles.heroStats}>
            <Box style={styles.statPill}>
              <Text style={styles.statNumber}>{lists.length}</Text>
              <Text style={styles.statLabel}>Listas</Text>
            </Box>
            <Box style={styles.statPill}>
              <Text style={styles.statNumber}>0%</Text>
              <Text style={styles.statLabel}>Promedio</Text>
            </Box>
          </Box>
        </Box>

        <Box style={styles.sectionHeader}>
          <Box>
            <Text style={styles.sectionTitle}>Listas de tareas</Text>
            <Text style={styles.sectionSubtitle}>Toca una lista para ver sus pendientes.</Text>
          </Box>
        </Box>

        {editingList && (
          <Box style={styles.editCard}>
            <Box style={styles.editHeader}>
              <Box style={styles.editIcon}>
                <Ionicons name="create-outline" size={18} color={palette.primary} />
              </Box>
              <Box style={styles.editTitleWrap}>
                <Text style={styles.editTitle}>Editar lista</Text>
                <Text numberOfLines={1} style={styles.editSubtitle}>
                  {editingList.title}
                </Text>
              </Box>
            </Box>
            <TextInput
              placeholder="Nombre de la lista"
              placeholderTextColor={palette.muted}
              value={editingName}
              onChangeText={setEditingName}
              style={styles.input}
            />
            <Box style={styles.editActions}>
              <Pressable
                onPress={saveEdit}
                style={[styles.formButton, styles.primaryButton]}
              >
                <Text style={styles.primaryButtonText}>Guardar</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setEditingList(null);
                  setEditingName("");
                }}
                style={[styles.formButton, styles.secondaryButton]}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </Pressable>
            </Box>
          </Box>
        )}

        {loading && (
          <Box style={styles.loadingCard}>
            <Spinner size="large" color={palette.primary} />
            <Text style={styles.loadingText}>Cargando tus listas...</Text>
          </Box>
        )}

        {!loading && error && (
          <Box style={styles.feedbackCard}>
            <Ionicons name="alert-circle-outline" size={28} color={palette.danger} />
            <Text style={styles.feedbackTitle}>Algo no salió bien</Text>
            <Text style={styles.feedbackText}>{error}</Text>
            <Pressable onPress={loadLists} style={[styles.formButton, styles.primaryButton]}>
              <Text style={styles.primaryButtonText}>
                Reintentar
              </Text>
            </Pressable>
          </Box>
        )}

        {!loading && !error && lists.length === 0 && (
          <Box style={styles.feedbackCard}>
            <Box style={styles.emptyIcon}>
              <Ionicons name="sparkles-outline" size={26} color={palette.primary} />
            </Box>
            <Text style={styles.feedbackTitle}>
              No hay listas disponibles
            </Text>
            <Text style={styles.feedbackText}>
              Crea tu primera lista con el botón inferior.
            </Text>
          </Box>
        )}

        {!loading && !error && (
          <FlatList
            data={lists}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskListCard
                item={item}
                onEdit={startEdit}
                onDelete={confirmDelete}
                deleting={deletingListId === item.id}
              />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={palette.primary}
              />
            }
          />
        )}
      </Box>
      <CreateButton
        label="+"
        onPress={() => router.push("/lists/create")}
        style={styles.floatingButton}
      />
  
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  editActions: {
    flexDirection: "row",
    gap: 10,
  },
  editCard: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
    ...shadow,
  },
  editHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  editIcon: {
    alignItems: "center",
    backgroundColor: palette.primarySoft,
    borderRadius: 14,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  editSubtitle: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  editTitle: {
    color: palette.ink,
    fontWeight: "900",
  },
  editTitleWrap: {
    flex: 1,
    minWidth: 0,
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
    borderRadius: 16,
    borderWidth: 1,
    padding: 22,
  },
  feedbackText: {
    color: palette.muted,
    lineHeight: 20,
    marginBottom: 16,
    marginTop: 6,
    textAlign: "center",
  },
  feedbackTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "center",
  },
  floatingButton: {
    borderRadius: 30,
    bottom: 90,
    height: 60,
    position: "absolute",
    right: 20,
    width: 60,
  },
  formButton: {
    alignItems: "center",
    flex: 1,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  hero: {
    backgroundColor: palette.primaryDark,
    borderRadius: 24,
    marginBottom: 18,
    overflow: "hidden",
    padding: 20,
    ...shadow,
  },
  heroEyebrow: {
    color: "#ffd6e7",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 14,
    textTransform: "uppercase",
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  heroStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  heroSubtitle: {
    color: "#ffd6e7",
    marginTop: 6,
  },
  heroTitle: {
    color: "white",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 4,
  },
  input: {
    backgroundColor: "#fff7fb",
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    color: palette.ink,
    marginBottom: 12,
    padding: 12,
  },
  listContent: {
    paddingBottom: 110,
  },
  loadingCard: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  loadingText: {
    color: palette.muted,
    fontWeight: "700",
    marginTop: 10,
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
    flex: 1,
    padding: 16,
  },
  secondaryButton: {
    backgroundColor: palette.primarySoft,
  },
  secondaryButtonText: {
    color: palette.primaryDark,
    fontWeight: "800",
    textAlign: "center",
  },
  sectionHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionSubtitle: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 3,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: "#ffe4ef",
    fontSize: 12,
    fontWeight: "700",
  },
  statNumber: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },
  statPill: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
});
