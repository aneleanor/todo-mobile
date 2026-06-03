import { palette, shadow } from "@/constants/ui";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
};

type Props = {
  task: Task;
  onToggle: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onMenu?: (id: string) => void;
};

export function TaskItem({ task, onToggle, onEdit, onDelete }: Props) {
  const title = task.title.trim() || "Tarea sin título";
  const description = task.description.trim();
  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Pressable
          onPress={() => onToggle(task.id)}
          style={[
            styles.checkbox,
            task.completed && styles.checkboxCompleted,
          ]}
        >
          {task.completed && <Ionicons name="checkmark" size={15} color="white" />}
        </Pressable>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              task.completed && styles.completedText,
            ]}
          >
            {title}
          </Text>

          {description ? (
            <Text style={styles.description}>
              {description}
            </Text>
          ) : null}

          {formattedDueDate && (
            <View style={styles.dueDatePill}>
              <Ionicons name="calendar-outline" size={13} color={palette.primaryDark} />
              <Text style={styles.dueDateText}>{formattedDueDate}</Text>
            </View>
          )}
        </View>

        {(onEdit || onDelete) && (
          <View style={styles.actions}>
            {onEdit && (
              <Pressable onPress={() => onEdit(task)} style={styles.actionButton}>
                <Ionicons name="create-outline" size={17} color={palette.primary} />
              </Pressable>
            )}
            {onDelete && (
              <Pressable onPress={() => onDelete(task.id)} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={17} color={palette.danger} />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
    ...shadow,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: "#fffafd",
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 12,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  actions: {
    alignItems: "center",
    gap: 8,
    marginLeft: 12,
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    alignItems: "center",
    borderColor: "#f0a8c7",
    borderRadius: 8,
    borderWidth: 1,
    height: 24,
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
    width: 24,
  },
  checkboxCompleted: {
    backgroundColor: palette.success,
    borderColor: palette.success,
  },
  textContainer: {
    flex: 1,
    minHeight: 50,
    minWidth: 0,
  },
  title: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#b98aa0",
  },
  description: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  dueDatePill: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: palette.primarySoft,
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dueDateText: {
    color: palette.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },
  delete: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
  },
  edit: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "600",
  },
  menu: {
    fontSize: 18,
    color: "#999",
  },
});
