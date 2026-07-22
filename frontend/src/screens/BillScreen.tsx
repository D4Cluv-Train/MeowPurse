import { View, Text, StyleSheet } from "react-native";

export default function BillScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>喵记</Text>
      <Text style={styles.subtitle}>暂无账单记录</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
  },
});
