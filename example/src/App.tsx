import * as React from 'react';
import { useState } from 'react';
import { TextInput } from 'react-native';
import { SafeAreaView } from 'react-native';

import { Button, StyleSheet } from 'react-native';
import { CustomWebviewPortal } from 'webview-v1';

export default function App() {
  const [text, onChangeText] = useState(
    'https://dev.fusion-wall2.smaad.net/wall/156348913/?u=reacttest'
  );

  const handleSwitchToWebView = () => {
    const domainSettings = [
      'dev.fusion-wall.smaad.net',
      'dev.fusion-wall2.smaad.net',
      'offerwall.stg.smaad.net',
      'offerwall.dev.smaad.net',
      'wall.smaad.net',
      'offerwall.smaad.net',
    ];
    CustomWebviewPortal.show(text, { whiteListDomain: domainSettings });
    // WebViewNativeModule.presentNewScreen(domainSettings, text);
  };
  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
      />

      <Button title="Open" onPress={handleSwitchToWebView} />
      <CustomWebviewPortal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
