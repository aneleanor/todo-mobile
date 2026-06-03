import { Alert, Platform } from "react-native";

type ConfirmDestructiveActionOptions = {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void | Promise<void>;
};

export function confirmDestructiveAction({
  title,
  message,
  confirmText = "Eliminar",
  onConfirm,
}: ConfirmDestructiveActionOptions) {
  if (Platform.OS === "web") {
    const confirm = (globalThis as typeof globalThis & {
      confirm?: (message?: string) => boolean;
    }).confirm;

    if (!confirm || confirm(`${title}\n\n${message}`)) {
      void onConfirm();
    }

    return;
  }

  Alert.alert(title, message, [
    { text: "Cancelar", style: "cancel" },
    {
      text: confirmText,
      style: "destructive",
      onPress: () => {
        void onConfirm();
      },
    },
  ]);
}
