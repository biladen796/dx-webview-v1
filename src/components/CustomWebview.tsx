import React, { memo, useRef, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Linking,
} from 'react-native';
import WebView from 'react-native-webview';
import base64 from 'base-64';
import url from 'url';

type Props = {};

type State = {
  show: boolean;
  headers?: Record<string, any>;
  showLoginForm: boolean;
  loginFormData?: {
    name: string;
    pass: string;
  };
  uri: string;
  isLogin: boolean;
};

type ShowOptions = {
  whiteListDomain?: string[];
};

const CLOSE_MESS_DATA = 'request-close-react-native';

const isWhiteListed = (whiteList: string[], uriWeb: string) => {
  const uriCom = url.parse(uriWeb);
  if (whiteList.length > 0) {
    const isWhiteList = whiteList.some((el) => el === uriCom.host);
    return isWhiteList;
  }
  return true;
};

class CustomWebviewPortal extends React.Component<Props, State> {
  showMessageTimeout: NodeJS.Timeout | null = null;
  hideLoadingTimeout: NodeJS.Timeout | null = null;
  static modal: CustomWebviewPortal;
  showing = false;
  whitelistDomain: string[] = [];
  constructor(props: Props) {
    super(props);
    this.state = {
      show: false,
      headers: undefined,
      showLoginForm: false,
      loginFormData: undefined,
      uri: '',
      isLogin: false,
    };
    CustomWebviewPortal.modal = this;
  }

  static show(uriWeb: string, options?: ShowOptions) {
    CustomWebviewPortal.modal.show(uriWeb, options);
  }

  static getCurrentHeaders() {
    return CustomWebviewPortal.modal.state.headers;
  }

  static hide() {
    CustomWebviewPortal.modal.hide();
  }

  clearMessageTimeout() {
    if (this.showMessageTimeout) {
      clearTimeout(this.showMessageTimeout);
      this.showMessageTimeout = null;
    }
  }

  clearLoadingTimeout() {
    if (this.hideLoadingTimeout) {
      clearTimeout(this.hideLoadingTimeout);
      this.hideLoadingTimeout = null;
    }
  }

  show(uriWeb: string, options?: ShowOptions) {
    this.clearLoadingTimeout();
    if (!this.showing) {
      Keyboard.dismiss();
      this.showing = true;
      console.log('Show', options);
      if (options?.whiteListDomain) {
        this.whitelistDomain = options?.whiteListDomain;
      } else {
        this.whitelistDomain = [];
      }
      this.openUrlInWhiteList(this.whitelistDomain, uriWeb);
    }
  }

  openUrlInWhiteList(whitelistDomain: string[], uriWeb: string) {
    const isWhiteList = isWhiteListed(whitelistDomain, uriWeb);
    isWhiteList
      ? this.setState({ show: true, uri: uriWeb })
      : Linking.openURL(uriWeb);
  }

  hide() {
    if (this.showing) {
      this.showing = false;
      this.setState({
        show: false,
        showLoginForm: false,
        uri: '',
        headers: undefined,
      });
    }
  }

  openLoginForm(urlFail: string) {
    this.setState({
      showLoginForm: true,
      //   show: false,
      uri: urlFail,
      show: false,
      loginFormData: undefined,
    });
  }

  render() {
    const { show, showLoginForm } = this.state;
    return (
      <>
        {show && (
          <CustomWebview
            uri={this.state.uri}
            headers={this.state.headers}
            onAuthError={this.openLoginForm.bind(this)}
            onCloseWebview={this.hide.bind(this)}
            onLoadEnd={() => {
              this.setState({
                isLogin: true,
              });
            }}
            loginData={
              this.state.isLogin ? this.state.loginFormData : undefined
            }
            onChangeHost={(newUrl) => {
              const isWhiteList = isWhiteListed(this.whitelistDomain, newUrl);
              isWhiteList
                ? this.setState({
                    headers: undefined,
                    showLoginForm: false,
                    show: true,
                    uri: newUrl,
                    isLogin: false,
                    loginFormData: undefined,
                  })
                : Linking.openURL(newUrl);
            }}
          />
        )}
        {showLoginForm && (
          <LoginForm
            onCancel={() => {}}
            onSubmit={({ name, pass }) => {
              this.setState({
                headers: {
                  Authorization: 'Basic ' + base64.encode(`${name}:${pass}`),
                },
                showLoginForm: false,
                show: true,
                loginFormData: {
                  name,
                  pass,
                },
              });
            }}
          />
        )}
      </>
    );
  }
}

const CustomWebview = memo(
  ({
    headers,
    uri,
    onAuthError,
    onCloseWebview,
    loginData,
    onChangeHost,
    onLoadEnd,
  }: {
    loginData?: { name: string; pass: string };
    headers: any;
    uri: string;
    onAuthError: (failUrl: string) => void;
    onCloseWebview: () => void;
    onChangeHost: (newUrl: string) => void;
    onLoadEnd: () => void;
  }) => {
    const ref = useRef<WebView>(null);
    return (
      <View style={[StyleSheet.absoluteFill, styles.container]}>
        <WebView
          ref={ref}
          mediaPlaybackRequiresUserAction={false}
          onShouldStartLoadWithRequest={(event) => {
            console.log('onShouldStartLoadWithRequest', event);
            const newUrlObj = url.parse(event.url);
            const curUrlObj = url.parse(uri);

            if (newUrlObj.host !== curUrlObj.host) {
              onChangeHost(event.url);
              return false;
            }

            return true;
          }}
          basicAuthCredential={
            loginData
              ? {
                  username: loginData.name,
                  password: loginData.pass,
                }
              : undefined
          }
          onLoadEnd={(e) => {
            const newUrlObj = url.parse(e.nativeEvent.url);
            const curUrlObj = url.parse(uri);
            if (newUrlObj.host === curUrlObj.host && !e.nativeEvent.loading) {
              onLoadEnd();
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(mess) => {
            console.log('onMessage', mess.nativeEvent);

            if (mess.nativeEvent.data === CLOSE_MESS_DATA) {
              onCloseWebview();
            }
          }}
          onHttpError={(event) => {
            if (event.nativeEvent.statusCode === 401) {
              onAuthError(event.nativeEvent.url);
            }
          }}
          source={{ uri, headers }}
          setSupportMultipleWindows={false}
          containerStyle={styles.webviewContainer}
        />
      </View>
    );
  }
);

const LoginForm = memo(
  ({
    onCancel,
    onSubmit,
  }: {
    onCancel: () => void;
    onSubmit: ({ name, pass }: { name: string; pass: string }) => void;
  }) => {
    const [name, setName] = useState('fusion');
    const [pass, setPass] = useState('7Kv2Dt');
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.container,
          { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        ]}
      >
        <View style={styles.loginContainer}>
          <View>
            <Text style={{ fontSize: 20 }}>Authentication Required</Text>
          </View>
          <View>
            <Text>Enter your login credentials</Text>
          </View>
          <View>
            <TextInput
              placeholder="Username"
              value={name}
              onChangeText={(text) => {
                setName(text);
              }}
            />
          </View>
          <View>
            <TextInput
              placeholder="Password"
              secureTextEntry={true}
              value={pass}
              onChangeText={(text) => {
                setPass(text);
              }}
            />
          </View>
          <View style={styles.buttonContainer}>
            <View>
              <Button title="CANCEL" onPress={onCancel} />
            </View>
            <View style={{ marginLeft: 8 }}>
              <Button title="OK" onPress={() => onSubmit({ name, pass })} />
            </View>
          </View>
        </View>
      </View>
    );
  }
);

export default CustomWebviewPortal;

const styles = StyleSheet.create({
  modal: {
    flex: 1,
  },
  webviewContainer: { width: '100%', height: '100%' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 5,
  },
  loginContainer: {
    backgroundColor: 'white',
    padding: 24,
    width: '80%',
    zIndex: 20,
    elevation: 5,
  },
  placeholder: {
    height: 120,
  },
  messageContainer: {
    alignSelf: 'stretch',
    height: 120,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 16,
    marginHorizontal: 24,
    textAlign: 'center',
  },
  loading: {
    width: 200,
  },
});
