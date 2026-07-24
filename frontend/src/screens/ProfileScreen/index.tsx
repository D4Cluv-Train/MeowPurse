import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { fetchUserProfile, removeToken } from "../../api";
import { UserProfile } from "../../types/user";
import ConfirmDialog from "../../components/common/Dialog";
import styles from "./styles";

const DEFAULT_AVATAR = require("../../../assets/icons/noAvatar.png");

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUserProfile()
        .then(setUser)
        .finally(() => setLoading(false));
    }, [])
  );

  const isLoggedIn = user !== null;
  const avatarSource = user?.avatar ? { uri: user.avatar } : DEFAULT_AVATAR;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const menuItems = [
    { label: "数据统计", action: "stats" },
    { label: "导出数据", action: "export" },
    { label: "关于喵记", action: "about" },
    { label: "设置", action: "settings" },
  ];

  const handleMenuPress = (action: string) => {
    if (action === "settings") return;
    if (action === "logout") {
      setShowLogoutDialog(true);
      return;
    }
    if (!loggedIn) {
      navigation.navigate("Login");
      return;
    }
  };

  const handleLogout = async () => {
    await removeToken();
    setUser(null);
    setShowLogoutDialog(false);
  };

  if (loading && user === undefined) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#ff6b35" />
      </View>
    );
  }

  // 加载完成但请求失败时，显示未登录状态
  const profile = user ?? null;
  const loggedIn = profile !== null;

  return (
    <View style={styles.container}>
      {/* 头像 + 昵称 + 创建时间 */}
      <View style={styles.header}>
        <Image source={avatarSource} style={styles.avatar} />
        {loggedIn ? (
          <>
            <Text style={styles.nickname}>{profile.nickname}</Text>
            <Text style={styles.createdAt}>{formatDate(profile.created_at)} 加入</Text>
          </>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginHint}>点击登录</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 菜单列表 */}
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.action}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.action)}
          >
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
        {loggedIn && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowLogoutDialog(true)}
          >
            <Text style={styles.logoutLabel}>退出登录</Text>
          </TouchableOpacity>
        )}
      </View>

      <ConfirmDialog
        visible={showLogoutDialog}
        title="退出登录"
        message="确定要退出当前账号吗？"
        rightText="退出"
        rightType="warning"
        leftText="取消"
        onRight={handleLogout}
        onLeft={() => setShowLogoutDialog(false)}
      />
    </View>
  );
}
