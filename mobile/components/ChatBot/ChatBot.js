import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import axios from "axios";

import { BACKEND_URL } from '@env'

const backend = BACKEND_URL

const ChatBot = ({ setModalVisible }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const slideAnim = new Animated.Value(0); // Start off the screen

  useEffect(() => {
    // Animate the component into view
    Animated.timing(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, []);

  const sendMessage = async () => {
    if (inputText.trim().length > 0) {
      // First, add the user message to the messages array
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputText, sender: "user" },
      ]);
      try {
        setInputText("");
        // Send the message to your backend
        const response = await axios.post(backend + "/api/chatbot/therapist", {
          text: inputText,
        });
        // Append the bot's response to the messages array
        const botMessage = response.data.response;
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: botMessage, sender: "bot" },
        ]);
      } catch (error) {
        // Handle the error if the API call fails
        console.error("API call failed:", error);
      }
    }
  };

  const slideOut = () => {
    // Animate the component out of view
    Animated.timing(slideAnim, {
      toValue: 100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false)); // Hide the modal after the animation
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
    >
      <TouchableOpacity onPress={slideOut} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.messagesContainer}>
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.message,
                message.sender === "user"
                  ? styles.userMessage
                  : styles.receivedMessage,
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: "#1e1e30",
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 5,
    backgroundColor: "#343456", // A slightly lighter shade for the button
    borderRadius: 5, // Rounded corners for modern look
    elevation: 5, // Subtle shadow for depth
    marginTop: 40,
    marginLeft: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    padding: 10,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  message: {
    padding: 10,
    borderRadius: 10,
    margin: 10,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: "#3777f0",
    marginLeft: "20%",
    alignSelf: "flex-end",
  },
  receivedMessage: {
    backgroundColor: "#696969",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "white",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    marginBottom: 25,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
    backgroundColor: "black",
    color: "white",
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#3777f0",
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ChatBot;
