import React, { useEffect } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import SignOut from "../../components/SignOut/SignOut";
import InnerMosaic from "../../assets/white-removebg-preview.png"; // Import the same image used in the login page for consistency

const Profile = () => {
  const welcomeLines = "Would you like to sign out?".split("\n");
  const animatedValues = welcomeLines.map(() => new Animated.Value(0));

  const animateText = () => {
    const animations = welcomeLines.map((_, i) => {
      return Animated.timing(animatedValues[i], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      });
    });
    Animated.sequence(animations).start();
  };

  useEffect(() => {
    animateText();
  }, []);

  return (
    <View style={styles.container}>
      <Image source={InnerMosaic} style={styles.mosaicImage} />
      <View style={styles.spacer} />
      <View style={styles.welcomeContainer}>
        {welcomeLines.map((line, index) => (
          <Animated.Text
            key={`line-${index}`}
            style={[styles.title, { opacity: animatedValues[index] }]}
          >
            {line}
          </Animated.Text>
        ))}
      </View>
      <SignOut>
      </SignOut>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 90
  },
  spacer: {
    flex: 0, // This will allow the spacer to grow and fill the available space
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center", // This ensures text is centered
  },
  buttonContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 7,
  },
  signOutIcon: {
    width: 24, // This should be the size of your SignOut icon component
    height: 24,
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
    paddingLeft: 15,
  },
  welcomeContainer: {
    alignItems: "center", // Center the text horizontally
  },
});

export default Profile;
