/** 喵记 (MeowPurse) 前端 API 服务 */

import * as SecureStore from "expo-secure-store";
import type { AuthResponse, UserProfile } from "./types/user";

// ============================================================
// 配置
// ============================================================
// 真机 Expo Go：填 Mac 局域网 IP（终端执行 ipconfig getifaddr en0 查看）
// iOS 模拟器：用 localhost
// Android 模拟器：用 10.0.2.2
const API_HOST = "192.168.3.239"; // ← 改为你的 Mac IP
const BASE_URL = `http://${API_HOST}:8800/meowpurse/api`;

const TOKEN_KEY = "meowpurse_token";
const REQUEST_TIMEOUT = 8000; // 8 秒超时

// ============================================================
// Token 管理
// ============================================================
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ============================================================
// 基础请求
// ============================================================
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const json: ApiResponse<T> = await res.json();

    if (json.code !== 200) {
      throw new Error(json.message || "请求失败");
    }

    return json.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================
// 认证接口
// ============================================================
export async function login(
  account: string,
  password: string,
): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ account, password }),
  });
  await saveToken(data.token);
  return data;
}

export async function register(params: {
  username: string;
  password: string;
  nickname?: string;
  phone?: string;
  email?: string;
}): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/users", {
    method: "POST",
    body: JSON.stringify(params),
  });
  await saveToken(data.token);
  return data;
}

// ============================================================
// 用户接口
// ============================================================
export async function fetchUserProfile(): Promise<UserProfile | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    return await request<UserProfile>("/users/me");
  } catch {
    // Token 过期或无效，清除本地 token
    await removeToken();
    return null;
  }
}
