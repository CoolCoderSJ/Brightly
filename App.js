import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, AppState } from 'react-native';
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

import AsyncStorage from '@react-native-async-storage/async-storage';
const setObj = async (key, value) => { try { const jsonValue = JSON.stringify(value); await AsyncStorage.setItem(key, jsonValue) } catch (e) { console.log(e) } }
const setPlain = async (key, value) => { try { await AsyncStorage.setItem(key, value) } catch (e) { console.log(e) } }
const get = async (key) => { try { const value = await AsyncStorage.getItem(key); if (value !== null) { try { return JSON.parse(value) } catch { return value } } } catch (e) { console.log(e) } }
const delkey = async (key, value) => { try { await AsyncStorage.removeItem(key) } catch (e) { console.log(e) } }
const getAll = async () => { try { const keys = await AsyncStorage.getAllKeys(); return keys } catch (error) { console.error(error) } }

const gamma = 2.2;
const gammaCorrect = (percentage) => {
  return Math.pow(Math.E, (Math.log(percentage / 10))/2.2)
}

const toLinear = (gammaVal) => {
  return Math.pow(gammaVal, gamma) * 10;
}

const update = async () => {
  console.log("update triggered")
  const isInitialized = await initialize();
  if (!isInitialized) {
    console.log('Health Connect not initialized');
    return;
  }

  console.log("here 2")
  let state = AppState.currentState;
  console.log(state)
  if (state == 'active') {
    const grantedPermissions = await requestPermission([
      { accessType: 'read', recordType: 'Steps' },
    ]);

    console.log(grantedPermissions);
  }
  const result = await readRecords('Steps', {
    timeRangeFilter: {
      operator: 'between',
      startTime: String(new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()),
      endTime: String(new Date().toISOString())
    },
  });

  let steps = result.records[0].count;
  console.log(steps);

  let optimalBrightness = parseFloat(await get('optimalBrightness')) || 0.55;
  console.log(optimalBrightness);

  const { status } = await Brightness.requestPermissionsAsync();
  if (status === 'granted') {
    if (steps >= 10000) {
      console.log(1);
      Brightness.setSystemBrightnessAsync(gammaCorrect(optimalBrightness));
    }
    else {
      let percentage = steps / 10000* optimalBrightness;
      let gammaCorrected = gammaCorrect(percentage);
      console.log(percentage, gammaCorrected);
      Brightness.setSystemBrightnessAsync(gammaCorrected);
    }
  }
}

const start = async () => {
  console.log("here 1")

ReactNativeForegroundService.add_task(() => update(), {
  delay: 15000,
  onLoop: true,
  taskId: "updateBrightness",
  onError: (e) => console.log(`Error logging:`, e),
})

ReactNativeForegroundService.start({
  id: 1244,
  title: "Brightly Background Service", 
  message: "Reading health data in the background...", 
  icon: "ic_launcher",
  ServiceType: 'dataSync'
})
.then(() => console.log("Foreground service started"))
.catch((e) => console.error(`Error starting service:`, e));
}
start();

export default function App() {
  update();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Walk some more to increase brightness!</Text>
      <Text style={[styles.text, {marginTop: 20}]}>To set optimal brightness (the value to set when 10k steps reached), change your brightness to a preferred value then click the button below</Text>
      <TouchableOpacity onPress={async () => {
        await setPlain('optimalBrightness', toLinear(await Brightness.getBrightnessAsync()).toString());
        update();
      }}
      style={styles.button}>
        <Text style={[styles.text, {color: 'white'}]}>Set optimal brightness</Text>
      </TouchableOpacity>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  text: {
    fontSize: 20,
  },
  button: {
    backgroundColor: 'black',
    padding: 12,
    marginTop: 20,
    borderRadius: 9,
  }
});
