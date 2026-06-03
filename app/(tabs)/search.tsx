import TaskListCard from "@/components/TaskListCard/TaskListCard";
import { TaskItem } from "@/components/TaskItem/TaskItem";
import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { palette, shadow } from "@/constants/ui";
import { ApiError } from "@/services/api";
import { getLists } from "@/services/listService";
import { getTodos } from "@/services/todoService";
import { TaskList } from "@/types/TaskList";
import { useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSearchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [listData, todoData] = await Promise.all([getLists(), getTodos()]);

        setLists(
          listData.map((list) => ({
            id: list.id,
            title: list.name,
            subtitle: "Todo List",
            percentage: 0,
            tags: [],
            idColor: "bg-blue-500",
            idIcon: "list",
          }))
        );

        setTasks(
          todoData.map((todo) => ({
            id: todo.id,
            title: todo.title,
            description: todo.description,
            completed: todo.completed,
          }))
        );
      } catch (error) {
        console.log(error);
        setError(
          error instanceof ApiError
            ? error.message
            : "No se pudo cargar la búsqueda."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSearchData();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredLists = useMemo(() => {
    if (!normalizedQuery) {
      return lists;
    }

    return lists.filter((list) =>
      list.title.toLowerCase().includes(normalizedQuery)
    );
  }, [lists, normalizedQuery]);

  const filteredTasks = useMemo(() => {
    if (!normalizedQuery) {
      return tasks;
    }

    return tasks.filter((task) => {
      const searchable = `${task.title} ${task.description}`.toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [tasks, normalizedQuery]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: palette.ink, fontSize: 28, fontWeight: "900", marginBottom: 6 }}>
          Búsqueda
        </Text>
        <Text style={{ color: palette.muted, marginBottom: 16 }}>
          Encuentra listas y tareas por nombre o descripción.
        </Text>

        <TextInput
          placeholder="Buscar listas o tareas"
          value={query}
          onChangeText={setQuery}
          style={{
            backgroundColor: palette.surface,
            borderColor: palette.border,
            borderRadius: 14,
            borderWidth: 1,
            marginBottom: 20,
            padding: 14,
            ...shadow,
          }}
        />

        {loading && <Spinner size="large" color="grey" />}

        {!loading && error ? (
          <Text className="text-red-500 mb-4">{error}</Text>
        ) : null}

        {!loading && !error && (
          <>
            <Box className="mb-5">
              <Text style={{ color: palette.ink, fontSize: 14, fontWeight: "900", marginBottom: 12 }}>
                LISTAS
              </Text>
              {filteredLists.length === 0 ? (
                <Text style={{ color: palette.muted }}>No hay listas que coincidan.</Text>
              ) : (
                <FlatList
                  data={filteredLists}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <TaskListCard item={item} />}
                  scrollEnabled={false}
                />
              )}
            </Box>

            <Box>
              <Text style={{ color: palette.ink, fontSize: 14, fontWeight: "900", marginBottom: 12 }}>
                TAREAS
              </Text>
              {filteredTasks.length === 0 ? (
                <Text style={{ color: palette.muted }}>No hay tareas que coincidan.</Text>
              ) : (
                <FlatList
                  data={filteredTasks}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TaskItem task={item} onToggle={() => undefined} />
                  )}
                  scrollEnabled={false}
                />
              )}
            </Box>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
