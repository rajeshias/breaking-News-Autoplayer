import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useChannels } from "../hooks/useChannels";
import { MAX_CHANNELS } from "../constants";

type Props = NativeStackScreenProps<RootStackParamList, "ChannelManagement">;

export function ChannelManagementScreen({ navigation }: Props) {
  const { channels, addChannel } = useChannels();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter a channel handle or ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addChannel(trimmed);
      Alert.alert("Channel Added", `Channel added successfully.`, [
        { text: "Done", onPress: () => navigation.goBack() },
        { text: "Add Another", onPress: () => setInput("") },
      ]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to add channel.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <Text style={styles.heading}>Add a YouTube Channel</Text>
        <Text style={styles.subheading}>
          Enter the channel's @handle, username, or channel ID (UCxxxxx...).
        </Text>

        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          value={input}
          onChangeText={(t) => {
            setInput(t);
            setError(null);
          }}
          placeholder="@BBCNews  or  UCxxxxxxxxxxxxxxx"
          placeholderTextColor="#bbb"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Text style={styles.hint}>
          {channels.length}/{MAX_CHANNELS} channels used
        </Text>

        <TouchableOpacity
          style={[styles.addBtn, loading && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addBtnText}>Resolve &amp; Add Channel</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.apiNote}>
          Channel resolution uses YouTube Data API.{"\n"}
          Make sure your API key is set in .env
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  inner: {
    flex: 1,
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: "#666",
    marginBottom: 28,
    lineHeight: 20,
  },
  input: {
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
    color: "#222",
  },
  inputError: {
    borderColor: "#C62828",
  },
  errorText: {
    color: "#C62828",
    fontSize: 13,
    marginTop: 8,
  },
  hint: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 8,
    marginBottom: 24,
  },
  addBtn: {
    backgroundColor: "#C62828",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  addBtnDisabled: {
    backgroundColor: "#EF9A9A",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  apiNote: {
    fontSize: 11,
    color: "#bbb",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 17,
  },
});
