import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 40,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 25,
    fontWeight: "600",
    color: "#333",
  },
  fieldWrapper: {
    width: "100%",
    height: 72,
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fafafa",
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  errorHint: {
    width: "100%",
    color: "#e74c3c",
    fontSize: 12,
    marginTop: 4,
    paddingLeft: 4,
  },
  button: {
    width: "100%",
    height: 48,
    backgroundColor: "#323030ff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchHint: {
    fontSize: 14,
    color: "#999",
  },
  switchLink: {
    fontSize: 14,
    color: "#4a90d9",
    textDecorationLine: "underline",
  },
});
