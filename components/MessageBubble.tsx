import { Colors } from "@/constants/Colors";
import { Transaction } from "@/db/hooks";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  tx: Transaction;
}

export default function MessageBubble({ tx }: Props) {
  const colorScheme = useColorScheme();
  const isIncome = tx.type === "income";
  const bg = isIncome ? "#d1fae5" : "#fee2e2"; // greenish / redish
  const textColor = Colors[colorScheme ?? "light"].text;

  return (
    <View style={[styles.bubble, { backgroundColor: bg }]}>
      <Text style={[styles.amount, { color: textColor }]}>
        ₹{tx.amount.toLocaleString()}
      </Text>
      <Text style={[styles.category, { color: textColor }]}>{tx.category}</Text>
      {tx.notes ? (
        <Text style={[styles.notes, { color: textColor }]}>{tx.notes}</Text>
      ) : null}
      <Text style={[styles.date, { color: textColor }]}>
        {new Date(tx.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: "flex-start",
    maxWidth: "80%",
    borderRadius: 12,
    padding: 10,
    marginVertical: 4,
  },
  amount: {
    fontWeight: "700",
    fontSize: 16,
  },
  category: {
    fontSize: 14,
    marginTop: 2,
  },
  notes: {
    marginTop: 2,
    fontStyle: "italic",
  },
  date: {
    marginTop: 4,
    fontSize: 11,
    alignSelf: "flex-end",
  },
});
