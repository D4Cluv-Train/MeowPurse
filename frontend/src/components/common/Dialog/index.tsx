import { Modal, View, Text, TouchableOpacity } from "react-native";
import styles, { COLOR_MAP } from "./styles";

type ColorType = "warning" | "normal" | "expect";

interface DialogProps {
  visible: boolean;
  title: string;
  message: string;
  leftText?: string;
  rightText?: string;
  leftType?: ColorType;
  rightType?: ColorType;
  onLeft: () => void;
  onRight: () => void;
}

export default function Dialog({
  visible,
  title,
  message,
  leftText = "确定",
  rightText = "取消",
  leftType = "normal",
  rightType = "normal",
  onLeft,
  onRight,
}: DialogProps) {
  const leftColor = COLOR_MAP[leftType];
  const rightColor = COLOR_MAP[rightType];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onLeft}>
              <Text style={[styles.actionText, { color: leftColor }]}>{leftText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onRight}>
              <Text style={[styles.actionText, { color: rightColor }]}>{rightText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
