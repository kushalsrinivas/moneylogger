import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Budget, getBudgetsForMonth, upsertBudget } from "@/db/actions";
import { useTransactions } from "@/db/hooks";
import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const { transactions } = useTransactions();

  const refresh = async () => {
    setLoading(true);
    const data = await getBudgetsForMonth(month, year);
    setBudgets(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const promptAdd = () => {
    let cat = "";
    let amt = "";

    Alert.prompt(
      "New Budget Category",
      "Enter category name",
      [
        {
          text: "Next",
          onPress: (category) => {
            if (!category) return;
            cat = category;
            Alert.prompt(
              "Budget Limit",
              "Enter amount limit",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Save",
                  onPress: async (amountStr) => {
                    amt = amountStr || "0";
                    const amount = parseFloat(amt);
                    if (isNaN(amount)) return;
                    await upsertBudget(cat.toLowerCase(), amount, month, year);
                    refresh();
                  },
                },
              ],
              "plain-text"
            );
          },
        },
      ],
      "plain-text"
    );
  };

  // Compute spending totals for current month
  const spendingByCategory: Record<string, number> = {};
  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    if (d.getMonth() !== month || d.getFullYear() !== year) return;
    if (tx.type === "expense") {
      spendingByCategory[tx.category] =
        (spendingByCategory[tx.category] || 0) + tx.amount;
    }
  });

  const renderItem = ({ item }: { item: Budget }) => {
    const spent = spendingByCategory[item.category] || 0;
    const pct = item.amount_limit > 0 ? (spent / item.amount_limit) * 100 : 0;
    const color = pct > 100 ? "#f44336" : pct > 75 ? "#ff9800" : "#4caf50";

    return (
      <View style={styles.budgetRow}>
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold">{item.category}</ThemedText>
          <ThemedText>
            ₹{spent.toFixed(0)} / ₹{item.amount_limit} ({pct.toFixed(0)}%)
          </ThemedText>
        </View>
        <View
          style={{
            width: 8,
            height: 40,
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">
        Budgets - {now.toLocaleString("default", { month: "long" })}
      </ThemedText>

      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          loading ? null : (
            <ThemedText>No budgets set for this month.</ThemedText>
          )
        }
        contentContainerStyle={{ gap: 12 }}
      />

      <ThemedText style={styles.addButton} onPress={promptAdd} type="link">
        + Add Budget
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  addButton: {
    marginTop: 24,
    textAlign: "center",
  },
});
