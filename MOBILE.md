Pics.io builds native mobile apps with the help of Capacitor tool. Fodlers `ios` and `android` contain platform specific projects.

## Build for iOS

IOS build happens on Mac with **installed XCode**.

### 1. Install XCode and cocoapods

Install actual version of XCode. It may require some extra moves depending on OS and XCode version.
Additionally `cocoapods` package manager should be installed in system.

```
sudo gem install cocoapods
```
### Build iOS

First, sync repo files Fill the required into XCode and Android studio
`npx cap sync`

Open Xcode via
`npx cap open ios`




https://capacitorjs.com/docs/android/troubleshooting
Open Android Studio via
`npx cap open android`

Put keystroke file is required to sign the APK.
Keystroke store password: `saCdq2BNZ2RHA62`
Key alias: `Pics.io`
Key password: `saCdq2BNZ2RHA62`