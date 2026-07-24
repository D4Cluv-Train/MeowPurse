import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    paddingTop: 90,
    paddingBottom: 32,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    backgroundColor: "#f0f0f0",
  },
  nickname: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  createdAt: {
    fontSize: 14,
    color: "#999",
  },
  loginHint: {
    fontSize: 18,
    color: "#1e7ec3ff",
    fontWeight: "500",
  },
  menu: {
    marginTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#eee",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  menuLabel: {
    fontSize: 16,
    color: "#333",
  },
  menuArrow: {
    fontSize: 20,
    color: "#ccc",
  },
  logoutLabel: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
  },
});
