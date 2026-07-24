import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { mockLogin, mockRegister } from "../../mock/mockApi";
import Toast from "react-native-toast-message";
import styles from "./styles";

type Mode = "login" | "register";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);

  // 登录字段
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  // 注册字段
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");

  // 字段错误状态
  const [accountError, setAccountError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const resetFields = () => {
    setAccount("");
    setPassword("");
    setPhone("");
    setUsername("");
    setAccountError("");
    setPasswordError("");
    setPhoneError("");
    setUsernameError("");
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    resetFields();
  };

  const handleLogin = async () => {
    let valid = true;
    if (!account.trim()) {
      setAccountError("请输入账号或手机号");
      valid = false;
    }
    if (!password) {
      setPasswordError("请输入密码");
      valid = false;
    }
    if (!valid) return;
    setLoading(true);
    try {
      await mockLogin(account.trim(), password);
      Toast.show({
        type: "success",
        text1: "登录成功",
        onHide: () => navigation.goBack(),
      });
    } catch (e: any) {
      Toast.show({ type: "error", text1: e.message || "登录失败，请稍后重试" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    let valid = true;
    if (!username.trim()) {
      setUsernameError("请输入用户名");
      valid = false;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      setPhoneError("请输入正确的手机号");
      valid = false;
    }
    if (!valid) return;
    setLoading(true);
    try {
      await mockRegister(phone.trim(), username.trim());
      Toast.show({
        type: "success",
        text1: "注册成功",
        onHide: () => navigation.goBack(),
      });
    } catch (e: any) {
      Toast.show({ type: "error", text1: e.message || "注册失败，请稍后重试" });
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <View style={styles.container}>
      <View style={styles.logoSection}>
        <Image source={require("../../../assets/icon.png")} style={styles.logo} />
        <Text style={styles.welcomeText}>
          {isLogin ? "Back to MeowPurse" : "Join MeowPurse"}
        </Text>
      </View>

      {isLogin ? (
        <>
          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, accountError ? styles.inputError : null]}
              placeholder="账号/手机号"
              placeholderTextColor="#aaa"
              value={account}
              onChangeText={(t) => { setAccount(t); setAccountError(""); }}
              autoCapitalize="none"
            />
            {accountError ? <Text style={styles.errorHint}>{accountError}</Text> : null}
          </View>
          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              placeholder="密码"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={(t) => { setPassword(t); setPasswordError(""); }}
              secureTextEntry
            />
            {passwordError ? <Text style={styles.errorHint}>{passwordError}</Text> : null}
          </View>
        </>
      ) : (
        <>
          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, usernameError ? styles.inputError : null]}
              placeholder="用户名"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={(t) => { setUsername(t); setUsernameError(""); }}
              autoCapitalize="none"
            />
            {usernameError ? <Text style={styles.errorHint}>{usernameError}</Text> : null}
          </View>
          <View style={styles.fieldWrapper}>
            <TextInput
              style={[styles.input, phoneError ? styles.inputError : null]}
              placeholder="手机号"
              placeholderTextColor="#aaa"
              value={phone}
              onChangeText={(t) => { setPhone(t); setPhoneError(""); }}
              keyboardType="phone-pad"
              maxLength={11}
            />
            {phoneError ? <Text style={styles.errorHint}>{phoneError}</Text> : null}
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        activeOpacity={0.8}
        onPress={isLogin ? handleLogin : handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{isLogin ? "登 录" : "注 册"}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.switchRow}>
        <Text style={styles.switchHint}>
          {isLogin ? "没有账号？" : "已有账号？"}
        </Text>
        <TouchableOpacity
          onPress={() => switchMode(isLogin ? "register" : "login")}
        >
          <Text style={styles.switchLink}>{isLogin ? "去注册" : "去登录"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
