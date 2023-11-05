import { useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import React, { useState, useEffect, useCallback } from "react";
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import { useWarmUpBrowser } from "../../hooks/warmUpBrowser";
import GoogleAuth from "../../assets/googleAuth.png";
import InnerMosaic from "../../assets/white-removebg-preview.png";

WebBrowser.maybeCompleteAuthSession();

// Custom hook for typing effect
const useTypingEffect = (text, typingSpeed) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const timeoutId = setTimeout(function typeCharacter() {
      setDisplayedText((currentText) => currentText + text.charAt(index));
      index++;
      if (index < text.length) {
        setTimeout(typeCharacter, typingSpeed);
      }
    }, typingSpeed);

    return () => clearTimeout(timeoutId);
  }, [text, typingSpeed]);

  return displayedText;
};

const Login = () => {
  useWarmUpBrowser();
  const typingSpeed = 50; // Speed in milliseconds
  const welcomeText = useTypingEffect('Visualizing Your Emotions', typingSpeed);

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, [startOAuthFlow]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image source={InnerMosaic} style={styles.mosaicImage}/>
      <Text style={styles.mainTitle}>InnerMosaic</Text>
      <View style={styles.spacer} />
      <Text style={styles.title}>{welcomeText}</Text>
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
        <Image source={GoogleAuth} style={styles.authImage} />
        <Text style={styles.buttonText}>Log In with Google</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  mainTitle: {
    marginTop: 120,
    paddingTop: 40,
    color: "white",
    fontSize: 42
  },
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "space-around", // This will distribute space evenly
    padding: 20,
  },
  mosaicImage: {
    width: 300, 
    height: 300,
    marginBottom: -300,
    marginTop: 50
  },
  spacer: {
    flex: 0, // This will allow the spacer to grow and fill the available space
  },
  bottomSpacer: {
    flex: 0.0, // Smaller flex value than other spacers to move the button up
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: 'center', // This ensures text is centered
    marginBottom: 120
  },
  buttonContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: -300
  },
  authImage: {
    width: 24, 
    height: 24
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
    paddingLeft: 15
  },
});

export default Login;

