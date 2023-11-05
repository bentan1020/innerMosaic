import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import {
  Animated,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ChatBot from "../../components/ChatBot/ChatBot"; // Adjust the import path as needed
import DyingStarPieChart from "../../components/DyingStarPieChart/DyingStarPieChart.js";
import DateTimePicker from "@react-native-community/datetimepicker";
import Analyzer from "../../components/Analyzer/Analyzer";

import { BACKEND_URL } from '@env'

const backend = BACKEND_URL

export default function Home() {
  const { user } = useUser();
  const [analyzerModalVisible, setAnalyzerModalVisible] = useState(false);
  const [chatBotModalVisible, setChatBotModalVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const welcomeMessage = `Welcome Back, ${user.firstName}`.split("");
  const animatedValues = useRef(
    welcomeMessage.map(() => new Animated.Value(0))
  ).current;
  const [colorData, setColorData] = useState([
    { name: "Blue", value: 50, color: "rgba(0, 0, 255, 1)" },
    { name: "Gold", value: 5, color: "rgba(255, 215, 0, 1)" },
    { name: "Red", value: 5, color: "rgba(255, 0, 0, 1)" },
    { name: "Grey", value: 10, color: "rgba(169, 169, 169, 1)" },
    { name: "Green", value: 10, color: "rgba(0, 128, 0, 1)" },
    { name: "Sky Blue", value: 5, color: "rgba(135, 206, 235, 1)" },
    { name: "Black", value: 15, color: "rgba(0, 0, 0, 1)" },
  ]);

  useFocusEffect(
    React.useCallback(() => {
      // This function is called when the screen comes into focus
      const fetchAndSetData = async () => {
        try {
          // Assuming retrieveJournalEntry is the function that fetches your data
          await retrieveJournalEntry(new Date()); // You can pass in the current date or any other parameter you need
        } catch (error) {
          console.error("Error fetching data on focus:", error);
        }
      };
      setDate(new Date());
      fetchAndSetData();

      return () => {};
    }, [])
  );

  const insets = useSafeAreaInsets();

  // Custom style for the container with padding applied only at the top and bottom
  const containerStyle = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
    flex: 1,
    backgroundColor: "#121212",
  };

  useEffect(() => {
    if (user) {
      console.log(user.id);
      axios
        .post(backend + "api/auth/login", {
          userid: user.id,
          firstname: user.firstName,
          lastname: user.lastName,
          fullname: user.fullName,
        })
        .then((response) => {
          // Handle the response from the server
          console.log(response.data);
        })
        .catch((error) => {
          // Handle the error if the API call fails
          console.error("API call failed:", error);
        });
    }
  }, [user]);

  const animate = () => {
    const animations = welcomeMessage.map((_, index) => {
      return Animated.timing(animatedValues[index], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        delay: index * 30,
      });
    });

    // Start the animations and let them run indefinitely
    Animated.stagger(30, animations).start();
  };

  useEffect(() => {
    animate();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      animate();
      return () => {};
    }, [])
  );

  const colorMappings = {
    "dark blue": "rgba(0, 0, 139, 1)",
    "dark red": "rgba(139, 0, 0, 1)",
    yellow: "rgba(255, 255, 0, 1)",
    "dark purple": "rgba(48, 25, 52, 1)",
    green: "rgba(0, 128, 0, 1)",
    grey: "rgba(169, 169, 169, 1)",
    "sky blue": "rgba(135, 206, 235, 1)",
  };

  const retrieveJournalEntry = async (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    try {
      const response = await axios.post(
        backend + "api/journal/retrieve-journal",
        {
          date: formattedDate,
          uid: user.id,
        }
      );

      const colorData = response.data.color_analysis;
      console.log(colorData);

      // Convert the object into the array format required for the chart
      const dataArray = Object.keys(colorData).map((colorName) => {
        // Map the color name to a color value
        const colorValue = colorMappings[colorName] || "rgba(255, 255, 255, 1)"; // Fallback to white if color not found
        return {
          name: colorName.charAt(0).toUpperCase() + colorName.slice(1), // Capitalize the first letter
          value: colorData[colorName],
          color: colorValue,
        };
      });

      console.log(dataArray);
      setColorData(dataArray);
    } catch (error) {
      console.error("Error retrieving journal entry:", error);
    }
  };

  // Function to handle date change
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);

    if (event.type === "set") {
      // Check if date has been set/selected
      retrieveJournalEntry(currentDate); // Retrieve journal entry for the selected date
    }
  };

  const toggleAnalyzerModal = () => {
    setAnalyzerModalVisible(!analyzerModalVisible);
    if (!analyzerModalVisible) animate();
  };

  const toggleChatBotModal = () => {
    setChatBotModalVisible(!chatBotModalVisible);
    if (!chatBotModalVisible) animate();
  };

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar barStyle="light-content" />
      <View style={styles.background}>
        <View style={styles.textContainer}>
          {welcomeMessage.map((letter, index) => (
            <Animated.Text
              key={`${letter}-${index}`}
              style={[
                styles.h1,
                {
                  opacity: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            >
              {letter}
            </Animated.Text>
          ))}
        </View>
      </View>

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

      <View>
        <DyingStarPieChart data={colorData} />
      </View>

      <View style={styles.organizer}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.button} onPress={toggleAnalyzerModal}>
            <Text style={styles.buttonText}>Emotional Analysis</Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={false}
            visible={analyzerModalVisible}
            onRequestClose={toggleAnalyzerModal}
          >
            <View style={{ flex: 1, width: "100%" }}>
              <Analyzer setModalVisible={setAnalyzerModalVisible} date={date} />
            </View>
          </Modal>
        </View>

        {/* ChatBot Modal */}
        <View style={styles.container}>
          <TouchableOpacity style={styles.button} onPress={toggleChatBotModal}>
            <Text style={styles.buttonText}>Explore Your Feelings</Text>
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={false}
            visible={chatBotModalVisible}
            onRequestClose={toggleChatBotModal}
          >
            <View style={{ flex: 1, width: "100%" }}>
              <ChatBot setModalVisible={setChatBotModalVisible} />
            </View>
          </Modal>
        </View>
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  organizer: {
    flexDirection: "row",
    justifyContent: "center"
  },
  datePickerContainer: {
    flexDirection: "row", // Aligns children in a row
    justifyContent: "flex-start", // Aligns children to the start of the row
    alignItems: "center", // Aligns children vertically in the center
    marginLeft: 15,
    marginBottom: 40,
  },
  datePickerButton: {
    alignItems: "center",
  },
  datePickerButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  background: {
    marginLeft: 30,
    marginBottom: 30,
  },
  h1: {
    fontSize: 25,
    fontWeight: "bold",
    color: "white",
  },
  textContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  container: {
    marginTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#ffffff",
    paddingVertical: 20,
    paddingHorizontal: 5,
    borderRadius: 7.5,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
    margin: 8.5,
    textAlign: "center",
    backgroundColor: "black"
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  fullPageModal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121212",
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 18,
    color: "white",
    marginBottom: 30,
  },
  buttonClose: {
    marginTop: 20,
    backgroundColor: "#ff3b30",
    padding: 10,
    borderRadius: 20,
    elevation: 2,
  },
});
