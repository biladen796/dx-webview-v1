import React, {
  createRef,
  forwardRef,
  memo,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  Keyboard,
  StyleSheet,
  Linking,
  SafeAreaView,
  Modal,
} from 'react-native';
import WebView from 'react-native-webview';
import base64 from 'base-64';
import url from 'url';
import LoginForm from './LoginForm';

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
  customWebviewRef = createRef<any>();
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
        headers: undefined,
        showLoginForm: false,
        loginFormData: undefined,
        uri: '',
        isLogin: false,
      });
    }
  }

  openLoginForm(urlFail: string) {
    this.setState({
      showLoginForm: true,
      show: false,
      uri: urlFail,
      loginFormData: undefined,
    });
    // this.customWebviewRef.current.stopLoad();
  }

  render() {
    const { show, showLoginForm } = this.state;
    return (
      <>
        {show && (
          <CustomWebview
            uri={this.state.uri}
            ref={this.customWebviewRef}
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
              // if (isWhiteList) {
              //   Platform.OS === 'android' &&
              //     this.customWebviewRef?.current?.reload();
              // }
            }}
          />
        )}
        {showLoginForm && (
          <LoginForm
            onCancel={this.hide.bind(this)}
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
  forwardRef(
    (
      {
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
      },
      customWebviewRef
    ) => {
      const canGoBack = useRef(false);
      const ref = useRef<WebView>(null);
      useImperativeHandle(customWebviewRef, () => {
        return {
          reload: () => {
            canGoBack.current = false;
            ref.current?.clearHistory && ref.current?.clearHistory();
            ref.current?.reload();
          },
          stopLoad: () => {
            ref.current?.stopLoading();
          },
        };
      });
      return (
        <Modal
          visible={true}
          animationType="none"
          onRequestClose={() => {
            console.log('onRequestClose web', canGoBack.current);

            if (canGoBack.current) {
              ref.current?.goBack();
            } else {
              onCloseWebview();
            }
          }}
        >
          <SafeAreaView style={[StyleSheet.absoluteFill, styles.container]}>
            <WebView
              ref={ref}
              showsVerticalScrollIndicator={false}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              onShouldStartLoadWithRequest={(event) => {
                console.log('onShouldStartLoadWithRequest', event);
                const newUrlObj = url.parse(
                  event.mainDocumentURL ? event.mainDocumentURL : event.url
                );
                const curUrlObj = url.parse(uri);

                if (newUrlObj.host !== curUrlObj.host) {
                  onChangeHost(event.url);
                  return false;
                }

                return true;
              }}
              onNavigationStateChange={(state) => {
                console.log('onNavigationStateChange', state);
                if (!state.loading) {
                  canGoBack.current = state.canGoBack;
                }
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
                if (
                  newUrlObj.host === curUrlObj.host &&
                  !e.nativeEvent.loading
                ) {
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
                console.log('onHttpError', event.nativeEvent);

                if (event.nativeEvent.statusCode === 401) {
                  onAuthError(event.nativeEvent.url);
                }
              }}
              source={{ uri, headers }}
              setSupportMultipleWindows={false}
              containerStyle={styles.webviewContainer}
            />
          </SafeAreaView>
        </Modal>
      );
    }
  )
);

export default CustomWebviewPortal;

const styles = StyleSheet.create({
  modal: {
    flex: 1,
  },
  safeview: { position: 'absolute', width: '100%', height: '100%' },
  webviewContainer: { width: '100%', height: '100%' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'flex-end' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 2,
  },
  loginContainer: {
    backgroundColor: 'white',
    padding: 24,
    width: '80%',
    zIndex: 20,
    elevation: 2,
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
