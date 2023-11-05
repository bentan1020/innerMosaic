import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { NavigationContainer } from "@react-navigation/native";
import Constants from "expo-constants";
import * as React from "react";
import TabNavigator from "./components/TabNavigator/TabNavigator";

import * as SecureStore from "expo-secure-store";
import Login from "./screens/Login/Login";

const tokenCache = {
  async getToken(key) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

function App() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={Constants.expoConfig.extra.clerkPublishableKey}
    >
      <NavigationContainer>
        <SignedIn>
          <TabNavigator />
        </SignedIn>
        <SignedOut>
          <Login />
        </SignedOut>
      </NavigationContainer>
    </ClerkProvider>
  );
}

export default App;