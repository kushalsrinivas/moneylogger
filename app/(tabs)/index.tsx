import { StyleSheet, View } from "react-native";
import { G, Text as SvgText } from "react-native-svg";
import { PieChart } from "react-native-svg-charts";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useStats, useTransactions } from "@/db/hooks";

type PieSlice = {
  key: string;
  value: number;
  svg: { fill: string };
  arc?: { outerRadius?: string; padAngle?: number };
  label?: string;
};

export default function DashboardScreen() {
  const { transactions } = useTransactions();
  const { stats } = useStats();

  // Calculate current month totals
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let income = 0;
  let expenses = 0;
  const categoryTotals: Record<string, number> = {};

  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear)
      return;

    if (tx.type === "income") {
      income += tx.amount;
    } else {
      expenses += tx.amount;
      categoryTotals[tx.category] =
        (categoryTotals[tx.category] || 0) + tx.amount;
    }
  });

  const net = income - expenses;

  // Build pie slices (only for expenses)
  const colors = [
    "#4e79a7",
    "#f28e2b",
    "#e15759",
    "#76b7b2",
    "#59a14f",
    "#edc949",
    "#af7aa1",
  ];
  const slices: PieSlice[] = Object.entries(categoryTotals).map(
    ([cat, val], idx) => ({
      key: cat,
      value: val,
      svg: { fill: colors[idx % colors.length] },
      label: cat,
    })
  );

  const Labels = ({ slices }: { slices: readonly any[] }) => {
    return (
      <G>
        {slices.map((slice, index) => {
          const { pieCentroid, data } = slice;
          return (
            <SvgText
              key={`label-${index}`}
              x={pieCentroid[0]}
              y={pieCentroid[1]}
              fill="white"
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize={10}
              stroke="black"
              strokeWidth={0.2}
            >
              {data.key}
            </SvgText>
          );
        })}
      </G>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* XP & Streak Counters */}
      <View style={styles.statsRow}>
        <ThemedText type="title">XP: {stats?.xp ?? 0}</ThemedText>
        <ThemedText type="title">🔥 Streak: {stats?.streak ?? 0}</ThemedText>
      </View>

      {/* Numeric Overview */}
      <View style={styles.overviewRow}>
        <StatCard label="Income" value={income} color="#4caf50" />
        <StatCard label="Expenses" value={expenses} color="#f44336" />
        <StatCard
          label="Net"
          value={net}
          color={net >= 0 ? "#4caf50" : "#f44336"}
        />
      </View>

      {/* Pie Chart */}
      {slices.length > 0 ? (
        <View style={styles.chartContainer}>
          <PieChart style={{ height: 180 }} data={slices} outerRadius={"90%"}>
            <Labels slices={slices} />
          </PieChart>
        </View>
      ) : (
        <ThemedText>No expenses recorded this month.</ThemedText>
      )}
    </ThemedView>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: color }]}>
      <ThemedText type="subtitle">{label}</ThemedText>
      <ThemedText type="title" style={{ color }}>
        ₹{value.toFixed(0)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  overviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartContainer: {
    alignItems: "center",
  },
});
