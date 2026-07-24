import { StyleSheet } from "react-native";

export const COLOR_MAP: Record<string, string> = {
  warning: "#e74c3c",
  normal: "#999",
  expect: "#4a90d9",
};

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 0.5,
    borderTopColor: "#eee",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRightWidth: 0.5,
    borderRightColor: "#eee",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
