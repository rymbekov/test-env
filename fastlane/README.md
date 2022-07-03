fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios match_certs

```sh
[bundle exec] fastlane ios match_certs
```

Get ios certificates from git repo

### ios match_certs_force

```sh
[bundle exec] fastlane ios match_certs_force
```



### ios register_new_device

```sh
[bundle exec] fastlane ios register_new_device
```



### ios test

```sh
[bundle exec] fastlane ios test
```



### ios run_testflight

```sh
[bundle exec] fastlane ios run_testflight
```

Build Pics.io IOS app & upload to TestFlight

----


## Android

### android build_apk

```sh
[bundle exec] fastlane android build_apk
```

Build Pics.io Android signed APK

### android build_aab

```sh
[bundle exec] fastlane android build_aab
```

Build Pics.io Android signed Bundle (.aab)

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
