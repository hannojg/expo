---
title: Development Workflows
---

## Iterating on your product with development apps

When you build a development app for your project, you'll get a stable environment to load any changes to your app that can be defined in JavaScript or other asset-related changes to your app. Other changes to your app, whether defined directly in your **ios/** and **android/** directories or by packages or SDKs you choose to install, will require a new build of your development app.

To enforce an API contract between the JavaScript and native layers of your app, you should set the [`runtimeVersion`](../distribution/runtime-versions.md) value in **app.json** or **app.config.js**. Each build you make will have this value embedded and will only load bundles with the same `runtimeVersion`, in both development and production.

## Tools

### Tunnel URLs

`expo start` exposes your development server on a publicly available URL that can be accessed through firewalls from around the globe. This option is useful if you are not able to connect to your development server with the default LAN option or if you want to get feedback on your implementation while you are developing.

To get a tunneled URL, pass the `--tunnel` flag to `expo start` from the command line, or select the "tunnel" option for "CONNECTION" if you are using the developer tools.

### Published Updates

[`expo publish`](../workflow/publishing.md) packages the current state of your JavaScript and asset files into an optimized "update" stored on a free hosting service provided by Expo. Development apps can load published updates without needing to check out a particular commit or leave a development machine running.

### QR Codes

You can use our endpoint to generate a QR code that can be easily loaded by a development app.

Requests to `https://qr.expo.dev/development-client`, when supplied the query parameters

| parameter   | value                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `appScheme` | URL-encoded deeplinking scheme of your development app (defaults to `exp+{slug}` where slug is the value set in your app.json) |
| `url`       | URL of a update manifest to load (e.g. as provided by `expo publish`)                                                          |

receive a response with an SVG image containing a QR code that can be easily scanned to load a version of your project in your development app.

## Example Workflows

These are a few examples of workflows to help your team get the most out of your development app. If you come up with others that would be useful for other teams, please [submit a PR](https://github.com/expo/expo/blob/master/CONTRIBUTING.md#-updating-documentation) to share your knowledge!

### Development Builds

Developers on your team with expertise working with Xcode and Android Studio can update, review, and test changes to the native portion of your application and release them to your team periodically. The rest of your team can install these builds on their devices and simulators and quickly iterate on the JavaScript portion of your application without needing to understand and maintain the tooling required to create a new build.

### PR Previews

You can set up your CI process to publish your project whenever a pull request is merged or updated and add a QR code that can be used to view the change in a compatible development app.

[expo-preview-action](https://github.com/expo/expo-preview-action) can be used to implement this workflow in your project using GitHub Actions, or serve as a template in your CI of choice.
