import { View, Text, Image, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { fetchUserProfile } from "../../mock/mockApi";
import { UserProfile } from "../../types/user";
import styles from "./styles";

const DEFAULT_AVATAR = require("../../../assets/icons/noAvatar.png");

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null | undefined>(undefined);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchUserProfile().then(setUser);
  }, []);

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
    if (!isLoggedIn) {
      navigation.navigate("Login");
      return;
    }
  };

  if (user === undefined) return null;

  return (
    <View style={styles.container}>
      {/* 头像 + 昵称 + 创建时间 */}
      <View style={styles.header}>
        <Image source={avatarSource} style={styles.avatar} />
        {isLoggedIn ? (
          <>
            <Text style={styles.nickname}>{user.nickname}</Text>
            <Text style={styles.createdAt}>{formatDate(user.created_at)} 加入</Text>
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
      </View>
    </View>
  );
}
