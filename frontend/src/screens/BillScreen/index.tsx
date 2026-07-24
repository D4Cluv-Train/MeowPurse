import { View, Text } from "react-native";
import styles from "./styles";

export default function BillScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>喵记</Text>
      <Text style={styles.subtitle}>暂无账单记录</Text>
    </View>
  );
}
