import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

import { ThemeProvider } from "./src/contexts/theme/ThemeContext";
import { LanguageProvider } from "./src/contexts/LanguageContext";

import ChatScreen from './src/screens/ChatScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <ThemeProvider>
          <LanguageProvider>
            <ChatScreen />
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
