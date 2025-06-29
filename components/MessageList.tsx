import { Transaction } from "@/db/hooks";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import MessageBubble from "./MessageBubble";

type Props = {
  data: Transaction[];
};

export default function MessageList({ data }: Props) {
  return (
    <FlatList
      inverted // show latest at bottom but scroll to see older messages
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <MessageBubble tx={item} />
        </View>
      )}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 12,
  },
  itemContainer: {
    flexDirection: "row",
  },
});
