import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";
import {
  addTransaction,
  deleteTransaction,
  getAllTransactions,
} from "@/db/actions";
import { Transaction } from "@/db/hooks";
import { parseTransaction } from "@/lib/parser";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

export default function ChatScreen() {
  const [messages, setMessages] = useState<Transaction[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [undoTx, setUndoTx] = useState<Transaction | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const toastOpacity = useRef(new Animated.Value(0)).current;

  // initial fetch
  useEffect(() => {
    (async () => {
      const all = await getAllTransactions();
      setMessages(all);
    })();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    toastOpacity.setValue(0);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }, 2500);
    });
  };

  const handleSend = async (text: string) => {
    const parsed = parseTransaction(text);
    if (!parsed) return;
    try {
      const tx = await addTransaction(parsed, 10);
      setMessages((prev) => [tx, ...prev]);

      // confetti & toast
      setShowConfetti(true);
      showToast(`Saved ₹${tx.amount} (+10 XP)`);

      // setup undo option
      setUndoTx(tx);
      setTimeout(() => {
        setUndoTx(null);
      }, 8000);
    } catch (err) {
      console.error("Failed to save transaction", err);
    }
  };

  const handleUndo = async () => {
    if (!undoTx) return;
    try {
      await deleteTransaction(undoTx.id, 10);
      setMessages((prev) => prev.filter((m) => m.id !== undoTx.id));
      showToast("Undone");
    } catch (err) {
      console.error("Undo failed", err);
    } finally {
      setUndoTx(null);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      {showConfetti && (
        <ConfettiCannon
          count={60}
          origin={{ x: 0, y: 0 }}
          fadeOut
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}

      {toast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>✅ {toast}</Text>
        </Animated.View>
      )}

      <MessageList data={messages} />

      {undoTx && (
        <View style={styles.undoBar}>
          <Text style={styles.undoText}>Entry added.</Text>
          <Pressable onPress={handleUndo} style={styles.undoBtn}>
            <Text style={styles.undoBtnText}>Undo</Text>
          </Pressable>
        </View>
      )}

      <ChatInput onSend={handleSend} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  toast: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  toastText: {
    color: "#fff",
  },
  undoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    backgroundColor: "#eee",
  },
  undoText: {
    marginRight: 8,
  },
  undoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#d1d5db",
    borderRadius: 12,
  },
  undoBtnText: {
    fontWeight: "600",
  },
});
