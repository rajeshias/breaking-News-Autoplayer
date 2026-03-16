import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainScreen } from "../screens/MainScreen";
import { ChannelManagementScreen } from "../screens/ChannelManagementScreen";

export type RootStackParamList = {
  Main: undefined;
  ChannelManagement: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerStyle: { backgroundColor: "#C62828" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ title: "Breaking News Autoplayer" }}
        />
        <Stack.Screen
          name="ChannelManagement"
          component={ChannelManagementScreen}
          options={{ title: "Add Channel" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
