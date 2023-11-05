import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

export default function SignOut() {
  const { isLoaded, signOut } = useAuth();
  const [isPressed, setIsPressed] = useState(false);

  if (!isLoaded) {
    return null;
  }

  const buttonStyle = isPressed
    ? [styles.buttonContainer, styles.buttonPressed]
    : styles.buttonContainer;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={buttonStyle}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={signOut}
      >
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 20, // Add some space above the button
    textAlign: "center",
  },
  buttonContainer: {
    borderColor: "#FFFFFF",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: 150,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    // ... rest of your buttonContainer styles
  },
  buttonPressed: {
    backgroundColor: "red", // Change this to the color you want when the button is pressed
  },

  buttonText: {
    color: "#FFFFFF", // White text color for the button
    fontWeight: "bold",
    fontSize: 16,
  },
});
