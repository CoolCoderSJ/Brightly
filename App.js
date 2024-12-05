import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import * as Brightness from 'expo-brightness';

import {
  initialize,
  requestPermission,
  readRecords,
} from 'react-native-health-connect'

import ReactNativeForegroundService from "@supersami/rn-foreground-service";
ReactNativeForegroundService.register({
  config: {
  alert: true,
  onServiceErrorCallBack: () => {
  console.error("Foreground service error occurred");
  },
  }
});


export default function App() {
  const update = async () => {
    const isInitialized = await initialize();
    if (!isInitialized) {
      return;
    }

    const grantedPermissions = await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
    ]);

    const result = await readRecords('Steps', {
      timeRangeFilter: {
        operator: 'between',
        startTime: String(new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()),
        endTime: String(new Date().toISOString())
      },
    });

    console.log(result)

    const { status } = await Brightness.requestPermissionsAsync();
    if (status === 'granted') {
      Brightness.setSystemBrightnessAsync(1);
    }
  }

  update()

  return (
    <View style={styles.container}>
      <Text>Walk some more to increase brightness!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
