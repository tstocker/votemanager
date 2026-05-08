import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";

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
          }}
        />

        <Drawer.Screen
          name="create"
          options={{
            title: "Créer un vote",
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