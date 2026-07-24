import { UserProfile } from "../types/user";

// 模拟已登录用户数据
export const MOCK_USER: UserProfile = {
  user_id: 1,
  username: "meow",
  nickname: "喵小记",
  avatar: "",
  created_at: "2026-07-01T10:30:00",
};

// 模拟是否已登录（开发时切换此变量即可）
export const MOCK_IS_LOGGED_IN = false;
