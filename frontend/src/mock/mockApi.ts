import { UserProfile } from "../types/user";
import { MOCK_USER, MOCK_IS_LOGGED_IN } from "./user";

// 模拟获取用户信息
export async function fetchUserProfile(): Promise<UserProfile | null> {
  await delay(300);
  return MOCK_IS_LOGGED_IN ? MOCK_USER : null;
}

// --- 登录 / 注册 mock ---

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// 模拟登录：账号 "meow" + 密码 "123456" 视为有效
export async function mockLogin(account: string, password: string): Promise<AuthResponse> {
  await delay(800);
  if (account === "meow" && password === "123456") {
    return { token: "mock-jwt-token", user: MOCK_USER };
  }
  throw new Error("账号或密码错误");
}

// 模拟注册：手机号不为空且 ≥ 11 位即成功
export async function mockRegister(phone: string, username: string): Promise<AuthResponse> {
  await delay(800);
  if (!phone || phone.length < 11) {
    throw new Error("请输入正确的手机号");
  }
  if (!username) {
    throw new Error("请输入用户名");
  }
  return {
    token: "mock-jwt-token",
    user: { ...MOCK_USER, username, nickname: username },
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
