import { Progress, ProgressFilledTrack } from "../ui/progress";

import { TaskList } from "@/types/TaskList";
import { palette, shadow } from "@/constants/ui";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Box } from "../ui/box";
import { Pressable } from "../ui/pressable";
import { Text } from "../ui/text";

type Props = {
  item: TaskList;
  onEdit?: (item: TaskList) => void;
  onDelete?: (item: TaskList) => void;
  deleting?: boolean;
};

const TaskListCard: React.FC<Props> = ({ item, onEdit, onDelete, deleting = false }) => {
  const handlePress = () => {
    router.push({
      pathname: "/lists/[id]",
      params: {
        id: item.id,
        title: item.title,
      },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable onPress={handlePress} style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.iconBubble}>
              <Ionicons name="list" size={18} color={palette.primary} />
            </View>
            <View style={styles.titleText}>
              <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        </Pressable>

        {(onEdit || onDelete) && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Editar ${item.title}`}
                disabled={deleting}
                onPress={() => onEdit(item)}
                style={styles.actionButton}
              >
                <Ionicons name="create-outline" size={17} color={palette.primary} />
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Eliminar ${item.title}`}
                disabled={deleting}
                onPress={() => onDelete(item)}
                style={[styles.actionButton, styles.deleteButton, deleting && styles.actionButtonDisabled]}
              >
                {deleting ? (
                  <ActivityIndicator color={palette.danger} size="small" />
                ) : (
                  <Ionicons name="trash-outline" size={17} color={palette.danger} />
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <Pressable onPress={handlePress}>
        <Box className="mt-4">
          <Progress value={item.percentage} size="md">
            <ProgressFilledTrack />
          </Progress>
          <View style={styles.footer}>
            <Text style={styles.footerText}>{item.percentage}% completado</Text>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </View>
        </Box>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: "#fff7fb",
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 10,
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.border,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
    ...shadow,
  },
  content: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 2,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  footerText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  iconBubble: {
    alignItems: "center",
    backgroundColor: palette.primarySoft,
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    marginRight: 12,
    width: 42,
  },
  subtitle: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 2,
  },
  title: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: "800",
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    minWidth: 0,
  },
  titleText: {
    flex: 1,
    minWidth: 0,
  },
});

export default TaskListCard;
