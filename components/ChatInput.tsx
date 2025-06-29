import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

type Props = {
  onSend: (text: string) => void;
};

export default function ChatInput({ onSend }: Props) {
  const colorScheme = useColorScheme();
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { color: Colors[colorScheme ?? "light"].text }]}
        placeholder="Add a transaction..."
        placeholderTextColor={Colors[colorScheme ?? "light"].icon}
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSend}
        returnKeyType="send"
      />
      <Pressable style={styles.sendBtn} onPress={handleSend}>
        <IconSymbol
          name="paperplane.fill"
          size={22}
          color={Colors[colorScheme ?? "light"].tint}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#f1f1f1",
    marginRight: 8,
  },
  sendBtn: {
    padding: 8,
  },
});
