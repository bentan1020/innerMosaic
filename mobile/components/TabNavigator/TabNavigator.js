import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Image, View } from "react-native";

import Home from "../../screens/Home/Home";
import Journal from "../../screens/Journal/Journal";
import Profile from "../../screens/Profile/Profile";

import journalImage from "../../assets/journal.png";
import homeImage from "../../assets/home.png";
import profileImage from "../../assets/profile.png";

import { useUser } from "@clerk/clerk-expo";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { user } = useUser();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarLabel: () => null, // This line hides the tab bar labels
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1a1a2e",
          borderTopColor: "transparent",
        },
        tabBarItemStyle: {
          justifyContent: "center",
        },
        tabBarIcon: ({ focused }) => {
          let iconName;
          let iconStyle;

          if (route.name === "Home") {
            iconName = homeImage;
            iconStyle = {
              width: 24,
              height: 24,
              tintColor: focused ? "#fff" : "#aaa",
            };
          } else if (route.name === "Journal") {
            iconName = journalImage;
            iconStyle = {
              width: 24,
              height: 24,
              tintColor: focused ? "#fff" : "#aaa",
            };
          } else if (route.name === "Profile") {
            iconName = user.imageUrl ? { uri: user.imageUrl } : profileImage;
            iconStyle = {
              width: 24,
              height: 24,
              borderRadius: 12,
            };
          }

          return (
            <View style={{ overflow: "hidden" }}>
              <Image source={iconName} style={iconStyle} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Journal" component={Journal} />
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default TabNavigator;