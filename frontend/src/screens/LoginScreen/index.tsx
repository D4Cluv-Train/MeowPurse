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
import { SvgXml } from "react-native-svg";
import { login, register, removeToken } from "../../api";
import Toast from "react-native-toast-message";
import styles from "./styles";

const EYE_OPEN_SVG = `<svg viewBox="0 0 1024 1024" width="22" height="22"><path d="M341.333333 256h341.333334v85.333333H341.333333V256z m-170.666666 170.666667V341.333333h170.666666v85.333334H170.666667z m-85.333334 85.333333v-85.333333h85.333334v85.333333H85.333333z m0 85.333333v-85.333333H0v85.333333h85.333333z m85.333334 85.333334H85.333333v-85.333334h85.333334v85.333334z m170.666666 85.333333H170.666667v-85.333333h170.666666v85.333333z m341.333334 0v85.333333H341.333333v-85.333333h341.333334z m170.666666-85.333333v85.333333h-170.666666v-85.333333h170.666666z m85.333334-85.333334v85.333334h-85.333334v-85.333334h85.333334z m0-85.333333h85.333333v85.333333h-85.333333v-85.333333z m-85.333334-85.333333h85.333334v85.333333h-85.333334v-85.333333z m0 0V341.333333h-170.666666v85.333334h170.666666z m-426.666666 42.666666h170.666666v170.666667h-170.666666v-170.666667z" fill="#999"/></svg>`;

const EYE_CLOSED_SVG = `<svg viewBox="0 0 1024 1024" width="22" height="22"><path d="M0 298.666667h85.333333v85.333333H0V298.666667z m170.666667 170.666666H85.333333V384h85.333334v85.333333z m170.666666 85.333334v-85.333334H170.666667v85.333334H85.333333v85.333333h85.333334v-85.333333h170.666666z m341.333334 0H341.333333v85.333333H256v85.333333h85.333333v-85.333333h341.333334v85.333333h85.333333v-85.333333h-85.333333v-85.333333z m170.666666-85.333334h-170.666666v85.333334h170.666666v85.333333h85.333334v-85.333333h-85.333334v-85.333334z m85.333334-85.333333v85.333333h-85.333334V384h85.333334z m0 0V298.666667h85.333333v85.333333h-85.333333z" fill="#999"/></svg>`;

type Mode = "login" | "register";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);

  // 登录字段
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [secureLoginPwd, setSecureLoginPwd] = useState(true);

  // 注册字段
  const [phone, setPhone] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regNickname, setRegNickname] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [secureRegPwd, setSecureRegPwd] = useState(true);

  // 字段错误状态
  const [accountError, setAccountError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [regUsernameError, setRegUsernameError] = useState("");
  const [regNicknameError, setRegNicknameError] = useState("");
  const [regPasswordError, setRegPasswordError] = useState("");
  const [regConfirmPasswordError, setRegConfirmPasswordError] = useState("");

  const resetFields = () => {
    setAccount("");
    setPassword("");
    setSecureLoginPwd(true);
    setPhone("");
    setRegUsername("");
    setRegNickname("");
    setRegPassword("");
    setRegConfirmPassword("");
    setSecureRegPwd(true);
    setAccountError("");
    setPasswordError("");
    setPhoneError("");
    setRegUsernameError("");
    setRegNicknameError("");
    setRegPasswordError("");
    setRegConfirmPasswordError("");
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    resetFields();
  };

  const handleLogin = async () => {
    if (loading) return;
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
      await login(account.trim(), password);
      navigation.goBack();
      Toast.show({ type: "success", text1: "登录成功" });
    } catch (e: any) {
      Toast.show({ type: "error", text1: e.message || "登录失败，请稍后重试" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (loading) return;
    let valid = true;
    if (!regUsername.trim()) {
      setRegUsernameError("请输入用户名");
      valid = false;
    }
    if (!regNickname.trim()) {
      setRegNicknameError("请输入昵称");
      valid = false;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegPasswordError("密码至少 6 位");
      valid = false;
    }
    if (regPassword !== regConfirmPassword) {
      setRegConfirmPasswordError("两次密码不一致");
      valid = false;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      setPhoneError("请输入正确的手机号");
      valid = false;
    }
    if (!valid) return;
    setLoading(true);
    try {
      await register({
        username: regUsername.trim(),
        password: regPassword,
        nickname: regNickname.trim(),
        phone: phone.trim(),
      });
      await removeToken();
      switchMode("login");
      // 预填登录账号
      setAccount(regUsername.trim());
      Toast.show({ type: "success", text1: "注册成功，请登录" });
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
            <View style={styles.pwdWrapper}>
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null, { paddingRight: 44 }]}
                placeholder="密码"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={(t) => { setPassword(t); setPasswordError(""); }}
                secureTextEntry={secureLoginPwd}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setSecureLoginPwd(!secureLoginPwd)}
              >
                <SvgXml xml={secureLoginPwd ? EYE_CLOSED_SVG : EYE_OPEN_SVG} />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorHint}>{passwordError}</Text> : null}
          </View>
        </>
      ) : (
        <>
          <View style={styles.row}>
            <View style={styles.halfFieldWrapper}>
              <TextInput
                style={[styles.input, regUsernameError ? styles.inputError : null]}
                placeholder="用户名"
                placeholderTextColor="#aaa"
                value={regUsername}
                onChangeText={(t) => { setRegUsername(t); setRegUsernameError(""); }}
                autoCapitalize="none"
              />
              {regUsernameError ? <Text style={styles.errorHint}>{regUsernameError}</Text> : null}
            </View>
            <View style={styles.halfFieldWrapper}>
              <TextInput
                style={[styles.input, regNicknameError ? styles.inputError : null]}
                placeholder="昵称"
                placeholderTextColor="#aaa"
                value={regNickname}
                onChangeText={(t) => { setRegNickname(t); setRegNicknameError(""); }}
              />
              {regNicknameError ? <Text style={styles.errorHint}>{regNicknameError}</Text> : null}
            </View>
          </View>
          <View style={styles.fieldWrapper}>
            <View style={styles.pwdWrapper}>
              <TextInput
                style={[styles.input, regPasswordError ? styles.inputError : null, { paddingRight: 44 }]}
                placeholder="密码（至少 6 位）"
                placeholderTextColor="#aaa"
                value={regPassword}
                onChangeText={(t) => { setRegPassword(t); setRegPasswordError(""); }}
                secureTextEntry={secureRegPwd}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setSecureRegPwd(!secureRegPwd)}
              >
                <SvgXml xml={secureRegPwd ? EYE_CLOSED_SVG : EYE_OPEN_SVG} />
              </TouchableOpacity>
            </View>
            {regPasswordError ? <Text style={styles.errorHint}>{regPasswordError}</Text> : null}
          </View>
          <View style={styles.fieldWrapper}>
            <View style={styles.pwdWrapper}>
              <TextInput
                style={[styles.input, regConfirmPasswordError ? styles.inputError : null, { paddingRight: 44 }]}
                placeholder="确认密码"
                placeholderTextColor="#aaa"
                value={regConfirmPassword}
                onChangeText={(t) => { setRegConfirmPassword(t); setRegConfirmPasswordError(""); }}
                secureTextEntry={secureRegPwd}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setSecureRegPwd(!secureRegPwd)}
              >
                <SvgXml xml={secureRegPwd ? EYE_CLOSED_SVG : EYE_OPEN_SVG} />
              </TouchableOpacity>
            </View>
            {regConfirmPasswordError ? <Text style={styles.errorHint}>{regConfirmPasswordError}</Text> : null}
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
