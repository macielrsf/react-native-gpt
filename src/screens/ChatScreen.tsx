import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import EventSource from "react-native-sse";
import uuid from "react-native-uuid";
import { Ionicons } from "@expo/vector-icons";
import { OPENAI_API_KEY } from "@env";

import { useTheme } from "../contexts/theme/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext"; 

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<FlatList>(null);

  const { theme, toggleTheme, isDark } = useTheme();
  const { t, toggleLanguage, language } = useLanguage();

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: uuid.v4().toString(),
      role: "user",
      content: input.trim(),
    };

    const aiMessage: Message = {
      id: uuid.v4().toString(),
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInput("");
    setIsStreaming(true);

    const es = new EventSource("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      method: "POST",
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          ...[...messages, userMessage].map(({ role, content }) => ({ role, content })),
        ],
        n: 1,
        temperature: 0.7,
        max_tokens: 600,
        stream: true,
      }),
      pollingInterval: 0,
    });

    es.addEventListener("message", (event) => {
      if (event.data !== "[DONE]") {
        const data = JSON.parse(event?.data || '');
        const delta = data.choices[0].delta?.content;

        if (delta) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessage.id ? { ...msg, content: msg.content + delta } : msg
            )
          );
        }
      } else {
        es.close();
        setIsStreaming(false);
      }
    });

    es.addEventListener("error", (err) => {
      console.error("SSE Error:", err);
      es.close();
      setIsStreaming(false);
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        {
          backgroundColor: item.role === "user" ? theme.bubbleUser : theme.bubbleAI,
          alignSelf: item.role === "user" ? "flex-end" : "flex-start",
        },
      ]}
    >
      <Text style={[styles.messageText, { color: theme.text }]}>{item.content}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleTheme} style={styles.toggleButton}>
          <Ionicons
            name={isDark ? "sunny-outline" : "moon-outline"}
            size={28}
            color={theme.text}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleLanguage} style={styles.toggleButton}>
          <Ionicons
            name="globe-outline"
            size={28}
            color={theme.text}
          />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={scrollRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputContainer, {backgroundColor: theme.background}]}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBackground, color: theme.text }]}
          placeholder={t('placeholder')}
          placeholderTextColor={isDark ? "#aaa" : "#666"}
          value={input}
          onChangeText={setInput}
          editable={!isStreaming}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={[styles.sendButton, { backgroundColor: theme.sendButton }]}
          disabled={isStreaming}
        >
          <Text style={styles.sendButtonText}>{t('send')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginVertical: 6,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    paddingVertical: 20,
    backgroundColor: "#fff",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  toggleButton: {
    alignSelf: "center",
    marginRight: 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  }
});
