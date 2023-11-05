import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useUser } from "@clerk/clerk-expo";
import { BACKEND_URL } from '@env'

const backend = BACKEND_URL

export default function Journal() {
  const { user } = useUser();
  const [initialEntry, setInitialEntry] = useState("");
  const [entry, setEntry] = useState("");
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [text, setText] = useState("What are your thoughts today?");
  const placeholderText = "Clear Your Thoughts".split("");
  const animatedValues = placeholderText.map(() => new Animated.Value(0));
  const animationIsRunningRef = useRef(false);

  // Animation for placeholder text
  const animatePlaceholder = (onComplete) => {
    if (animationIsRunningRef.current) {
      return; // If the animation is already running, do nothing
    }
    animationIsRunningRef.current = true;

    animatedValues.forEach((value) => value.setValue(0));
    const animations = animatedValues.map((value, index) => {
      return Animated.timing(value, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        delay: index * 30,
      });
    });

    Animated.stagger(30, animations).start(() => {
      animationIsRunningRef.current = false; // Reset the ref when the animation completes
      if (onComplete) {
        onComplete(); // Call the provided callback function after the animation completes
      }
    });
  };

  useEffect(() => {
    animatePlaceholder(() => retrieveJournalEntry(date));
    // No direct call to retrieveJournalEntry here, it's called after the animation completes
  }, []);

  // Handle text change
  const handleTextChange = (text) => {
    setEntry(text);
    setIsButtonVisible(text !== initialEntry); // Compare with initialEntry
  };

  // Handle save
  const handleSave = async () => {
    setIsButtonVisible(false);
    Keyboard.dismiss();
    const formattedDate = date.toISOString().split("T")[0]; // Format date to 'YYYY-MM-DD'
    await axios
      .post(backend + "api/aiResponse/process_journal_entry", {
        text: entry,
        date: formattedDate,
        uid: user.id,
      })
      .then((response) => {
        console.log(response.data.response);
        setText(response.data.response);
      })
      .catch((error) => {
        console.error("API call failed:", error);
      });
  };

  // Function to retrieve a journal entry for a given date
  const retrieveJournalEntry = async (date) => {
    const formattedDate = date.toISOString().split("T")[0]; // Format date to 'YYYY-MM-DD'
    try {
      const response = await axios.post(
        backend + "api/journal/retrieve-journal",
        {
          date: formattedDate,
          uid: user.id,
        }
      );
      const journalEntry = response.data.journal_entry || "";
      setEntry(journalEntry);
      setInitialEntry(journalEntry); // Set initial entry here
    } catch (error) {
      console.error("Error retrieving journal entry:", error);
      // Optionally handle error, e.g., show an error message to the user
    }
  };

  // Function to handle date change
  const onChangeDate = (event, selectedDate) => {
    setIsButtonVisible(false);
    const currentDate = selectedDate || date;
    setDate(currentDate);

    // Hide the button when date changes

    if (event.type === "set") {
      setIsButtonVisible(false);
      // Check if date has been set/selected
      retrieveJournalEntry(currentDate); // Retrieve journal entry for the selected date
    }
  };

  // Animated placeholder
  const animatedPlaceholder = placeholderText.map((letter, index) => (
    <Animated.Text
      key={`${letter}-${index}`}
      style={[styles.animatedLetter, { opacity: animatedValues[index] }]}
    >
      {letter}
    </Animated.Text>
  ));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.datePickerContainer}>
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
          maximumDate={new Date()}
          style={{ backgroundColor: "transparent" }}
        />
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <View style={styles.animatedPlaceholder} pointerEvents="none">
                {animatedPlaceholder}
              </View>
              <TextInput
                style={styles.input}
                multiline
                placeholder="Write it down..." // Placeholder text added here
                placeholderTextColor="#A9A9A9" // Placeholder text color (use any color you want)
                value={entry}
                onChangeText={handleTextChange}
                selectionColor="#fff"
              />
            </View>
            {isButtonVisible && (
              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Save Entry</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  datePickerContainer: {
    flexDirection: "row", // Aligns children in a row
    justifyContent: "flex-start", // Aligns children to the start of the row
    alignItems: "center", // Aligns children vertically in the center
    padding: 20,
  },
  datePickerButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    alignItems: "center",
    marginTop: 20,
  },
  datePickerButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 5,
  },
  card: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flex: 1,
    padding: 15,
  },
  input: {
    flex: 1,
    textAlignVertical: "top",
    color: "#fff",
    fontSize: 15,
    paddingTop: 40,
  },
  animatedPlaceholder: {
    position: "absolute",
    top: 0,
    left: 15,
    right: 15,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  animatedLetter: {
    color: "#bbb",
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  button: {
    backgroundColor: "#ff3b30",
    padding: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
