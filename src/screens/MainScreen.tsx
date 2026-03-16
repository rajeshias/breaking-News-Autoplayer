import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useChannels } from "../hooks/useChannels";
import { useKeyword } from "../hooks/useKeyword";
import { useMonitor } from "../hooks/useMonitor";
import { useLastPlayed } from "../hooks/useVideoQueue";
import { Channel } from "../types";
import { MAX_CHANNELS, POLL_CYCLE_MINUTES } from "../constants";
import { getIntervalSeconds } from "../services/pollingScheduler";
import { Platform } from "react-native";
import { requestBatteryOptimizationExemption } from "../services/batteryOptimization";

const ANDROID_PACKAGE = "com.rajeshkanna.breakingnewsautoplayer";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

export function MainScreen({ navigation }: Props) {
  const { channels, loading, removeChannel, reload } = useChannels();
  const { keyword, setKeyword } = useKeyword();
  const { isMonitoring, toggle } = useMonitor(channels.length, keyword);
  const { lastPlayed, clearHistory } = useLastPlayed();
  const [toggling, setToggling] = useState(false);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const handleToggle = async () => {
    if (channels.length === 0 && !isMonitoring) {
      Alert.alert("No Channels", "Add at least one channel before monitoring.");
      return;
    }
    if (!keyword.trim() && !isMonitoring) {
      Alert.alert("No Keyword", "Enter a keyword to filter videos before monitoring.");
      return;
    }
    setToggling(true);
    try {
      await toggle();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to toggle monitoring.";
      Alert.alert("Error", msg);
    } finally {
      setToggling(false);
    }
  };

  const handleRemove = (channel: Channel) => {
    Alert.alert(
      "Remove Channel",
      `Remove "${channel.displayName}" from your list?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => removeChannel(channel.id) },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Clear seen video history? Previously matched videos will be eligible to play again.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: clearHistory },
      ]
    );
  };

  const intervalSec = getIntervalSeconds(channels.length);
  const statusText = isMonitoring
    ? `Monitoring ${channels.length} channel${channels.length !== 1 ? "s" : ""} · every ${intervalSec}s`
    : "Monitoring off";

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Monitor Toggle */}
      <View style={styles.monitorRow}>
        <View style={styles.monitorTextGroup}>
          <Text style={styles.monitorLabel}>{isMonitoring ? "● Live" : "○ Off"}</Text>
          <Text style={styles.monitorStatus}>{statusText}</Text>
        </View>
        {toggling ? (
          <ActivityIndicator color="#C62828" />
        ) : (
          <Switch
            value={isMonitoring}
            onValueChange={handleToggle}
            trackColor={{ false: "#ccc", true: "#EF9A9A" }}
            thumbColor={isMonitoring ? "#C62828" : "#f4f3f4"}
          />
        )}
      </View>

      {/* Keyword Input */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>KEYWORD (applies to all channels)</Text>
        <TextInput
          style={styles.keywordInput}
          value={keyword}
          onChangeText={setKeyword}
          placeholder="e.g. breaking, live, urgent"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Last Played */}
      {lastPlayed && (
        <View style={styles.lastPlayedBanner}>
          <View style={styles.lastPlayedText}>
            <Text style={styles.lastPlayedLabel}>LAST PLAYED</Text>
            <Text style={styles.lastPlayedTitle} numberOfLines={1}>{lastPlayed.title}</Text>
            <Text style={styles.lastPlayedChannel}>{lastPlayed.channelName}</Text>
          </View>
          <TouchableOpacity onPress={handleClearHistory}>
            <Text style={styles.clearBtn}>Clear history</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Channels */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>CHANNELS ({channels.length}/{MAX_CHANNELS})</Text>
          {channels.length < MAX_CHANNELS && (
            <TouchableOpacity
              onPress={() => navigation.navigate("ChannelManagement")}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {channels.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyChannels}
            onPress={() => navigation.navigate("ChannelManagement")}
          >
            <Text style={styles.emptyChannelsText}>Tap here to add your first channel</Text>
          </TouchableOpacity>
        ) : (
          <FlatList
            data={channels}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.channelCard}>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelName}>{item.displayName}</Text>
                  <Text style={styles.channelHandle}>{item.handle}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemove(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      <Text style={styles.infoText}>
        Polls every {POLL_CYCLE_MINUTES} min total, phased across channels.{"\n"}
        Plays the latest matching video immediately when found.
      </Text>

      {Platform.OS === "android" && (
        <TouchableOpacity
          style={styles.batteryBtn}
          onPress={() => requestBatteryOptimizationExemption(ANDROID_PACKAGE)}
        >
          <Text style={styles.batteryBtnText}>Fix lock screen network access</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  monitorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  monitorTextGroup: { flex: 1 },
  monitorLabel: { fontSize: 18, fontWeight: "700", color: "#333" },
  monitorStatus: { fontSize: 12, color: "#888", marginTop: 2 },
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  keywordInput: {
    fontSize: 16,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 6,
  },
  lastPlayedBanner: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  lastPlayedText: { flex: 1, marginRight: 12 },
  lastPlayedLabel: { fontSize: 10, color: "#888", fontWeight: "600", letterSpacing: 0.5 },
  lastPlayedTitle: { fontSize: 13, color: "#fff", fontWeight: "600", marginTop: 2 },
  lastPlayedChannel: { fontSize: 11, color: "#aaa", marginTop: 2 },
  clearBtn: { color: "#888", fontSize: 12, textDecorationLine: "underline" },
  addBtn: {
    backgroundColor: "#C62828",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  emptyChannels: {
    paddingVertical: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 8,
  },
  emptyChannelsText: { color: "#aaa", fontSize: 14 },
  channelCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
  },
  channelInfo: { flex: 1 },
  channelName: { fontSize: 15, fontWeight: "600", color: "#222" },
  channelHandle: { fontSize: 12, color: "#888", marginTop: 2 },
  removeBtn: { fontSize: 16, color: "#C62828", fontWeight: "700", paddingLeft: 12 },
  infoText: {
    fontSize: 12,
    color: "#aaa",
    textAlign: "center",
    marginTop: 24,
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  batteryBtn: {
    marginTop: 12,
    marginHorizontal: 24,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C62828",
    borderRadius: 8,
  },
  batteryBtnText: {
    color: "#C62828",
    fontSize: 13,
    fontWeight: "600",
  },
});
