import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";
import Toast from "react-native-toast-message";
import BillScreen from "./screens/BillScreen";
import ProfileNavigator from "./navigation/ProfileNavigator";
import LoginScreen from "./screens/LoginScreen";

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#f5f5f5" },
        tabBarActiveTintColor: "#ff6b35",
      }}
    >
      <Tab.Screen
        name="Bill"
        component={BillScreen}
        options={{
          title: "账单",
          tabBarIcon: () => <Text>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          title: "我的",
          headerShown: false,
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "注册与登录" }}
        />
      </RootStack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
