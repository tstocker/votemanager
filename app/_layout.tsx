import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { AppState } from "react-native";

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: true,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Home",
            title: "Home",
            drawerIcon: ({ color, size }) => (
              <Ionicons
                name="home"
                size={size}
                color={color}
              />
            ),
            drawerItemStyle: { order: 0 }
          }}
        />
        <Drawer.Screen
          name="votes/index"
          options={{
            drawerLabel: "Liste des votes",
            title: "Liste des votes",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="create"
          options={{
            title: "Créer un vote",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="voters/index"
          options={{
            drawerLabel: "Votants",
            title: "Votants",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="votes/[id]/index"
          options={{
            drawerItemStyle: {
              display: "none"
            }
          }}
        />
        <Drawer.Screen
          name="votes/results/[id]"
          options={{
            drawerItemStyle: {
              display: "none"
            }
          }}
        />
        <Drawer.Screen
          name="votes/[id]/listVoter"
          options={{
            drawerItemStyle: { display: "none" }
          }}
        />
        <Drawer.Screen
          name="votes/[id]/form"
          options={{
            drawerItemStyle: { display: "none" }
          }}
        />
        <Drawer.Screen
          name="votes/[id]/results"
          options={{
            drawerItemStyle: { display: "none" }
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}