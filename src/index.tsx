import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'webview-v1' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const WebviewV1 = NativeModules.WebviewV1
  ? NativeModules.WebviewV1
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function multiply(a: number, b: number): Promise<number> {
  return WebviewV1.multiply(a, b);
}
