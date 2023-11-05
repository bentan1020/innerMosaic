import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";

import { BACKEND_URL } from '@env'

const backend = BACKEND_URL
const screenHeight = Dimensions.get("window").height;

const Analyzer = ({ setModalVisible, date }) => {
  const { user } = useUser();
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const [yourEntry, setYourEntry] = useState("");
  const [display, setDisplay] = useState("");

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          `${backend}api/journal/retrieve-journal-and-ask-ai`,
          {
            date: date,
            uid: user.id,
          }
        );
        if (response.data.response) {
          setDisplay(response.data.response);
          setYourEntry(response.data.your_entry);
        } else {
          setDisplay("No journal entry found for this day");
          setYourEntry("No journal entry found for this day");
        }
      } catch (error) {
        console.error("There was an error retrieving the journal data:", error);
      }
    };

    fetchData();
  }, [date]);

  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity style={styles.doneButton} onPress={slideOut}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.entryText}>Your Journal Entry</Text>
        <Text style={styles.responseText}>{yourEntry}</Text>
        <Text style={styles.entryText}>Emotional Analysis</Text>
        <Text style={styles.responseText}>{display}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  responseText: {
    fontSize: 18,
    color: "#FFFFFF", // White color for the main text to stand out
    backgroundColor: "#2a2a40", // A dark background for the box
    marginTop: 10,
    marginBottom: 20,
    padding: 15, // Padding inside the box
    borderRadius: 10, // Rounded corners for the box
    elevation: 2, // Subtle shadow for depth
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: 1 }, // Shadow position
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 2, // Shadow blur radius
  },
  container: {
    flex: 1,
    backgroundColor: "#1e1e30", // A dark midnight blue color background
    padding: 20,
    paddingTop: 50, // Updated padding
  },
  doneButton: {
    alignSelf: "flex-end",
    padding: 10,
    backgroundColor: "#343456", // A slightly lighter shade for the button
    borderRadius: 5, // Rounded corners for modern look
    elevation: 5, // Subtle shadow for depth
  },
  doneButtonText: {
    fontSize: 16,
    color: "#FFFFFF", // White text for contrast
  },
  content: {
    marginTop: 20,
  },
  entryText: {
    fontSize: 16,
    color: "#CCCCCC", // A lighter grey color text
    marginBottom: 10,
  },
});

export default Analyzer;
