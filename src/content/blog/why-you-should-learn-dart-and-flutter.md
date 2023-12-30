---
author: Davide Agostini
pubDatetime: 2021-03-26T10:25:54.547Z
title: Why you should learn Dart and Flutter
slug: why-you-should-learn-dart-and-flutter
featured: false
ogImage: https://github.com/satnaing/astro-paper/assets/53733092/1ef0cf03-8137-4d67-ac81-84a032119e3a
tags:
  - coding
  - flutter
description: "In this essay I convince you to use Dart and Flutter for mobile development."
---

In this post, I would like to give my point of view on using **Flutter** after a few intensive months of development of an application for the smart management of a hotel. I created from scratch a completely customized interface, I used animations, transformations, circular sliders, etc. The final result was truly amazing from the point of view of graphic quality and from the point of view of performance even on older phones.

This post will not talk about the app, but I will try to list the features of this framework and why many mobile developers have to take this into consideration.

## But…what is Flutter and how does it work?

Flutter is a UI toolkit that permits with a single codebase, build native compiled applications for mobile, desktop and web. Any application that you develop in Flutter is supported in the Android and iOS platforms and Web (Desktop development is in alpha).
Flutter uses a performant rendering engine, called _Skia_ to paint the UI, this it’s important because the OEM widgets are not needed anymore and the developer can freely control every single pixel of the screen. Instead of being a wrapper on top of native UI components (like React Native and Xamarin), Flutter draws the UI from scratch.

> #### Flutter maintain the native experience and feel of the app, and the developer doesn’t have to worry about the performance on any platform.

Unlike Android and iOS development, Flutter uses a **declarative paradigm** for building interfaces. In this way, the developer describes the current UI state and leaves the transition to the framework. For a more detailed and simple intro to _imperative vs declarative paradigm_ consult this interesting [video](https://www.youtube.com/watch?v=yOBBkIJBEL8) of Tadas Petra.

(Note: also iOS with Swift UI, and Android with Jetpack Compose UI use a declarative programming paradigm).

**Dart** is the programming language for the Flutter framework. It is a strongly typed programming language and has special features needed to allow the compilation to native code.

## Hot Reload

An important feature of Flutter is the Hot Reload (thanks to the **Just in Time** — JIT compilation) that permits to quickly and easily build UI, add features, and fix bugs. When you change your source code, these changes will be reflected back immediately in the running application because the Flutter framework automatically rebuilds the widget tree, allowing you to quickly view the effects of your changes. This aspect has a major impact on development time.

## Performance

In the performance field, Flutter seems to have no rivals, as it manages to provide performance comparable to those native applications. Flutter uses **Ahead-of-Time** (AOT) compilation to convert Dart code to native code. This mode has the advantage of speed, since, with the precompiled binary format, the code can be executed directly and quickly (this can help perform complex calculations or rendering).

## Customizable widget

Flutter apps are composed of widgets. Flutter provides a list of widgets from which to start in order to build your own interface. These widgets are easily usable and customizable according to your needs.

Also on the site pub.dev there are a huge variety of packages that can be used in Flutter for I/O, serialization/deserialization, localization, SQL database, ecc… and to use them you just need to add a line of code to a file called `pubspec.yaml`.

## Fast app development and Less cost

As already mentioned Flutter allows you to create mobile applications sharing the same code. This has a two-fold advantage:

1. it allows you to quickly develop a functioning and performing application on both operating systems;
2. reduce development costs as you pay the developer for the production of a single source code.

## Conclusion

Flutter is a young but very promising framework. Around it, there is a large community ready to support you and help you. There are a ton of resources in terms of excellent documentation, sample repositories, youtube channels, and open source code.

It is also a framework created and maintained by Google which is investing heavily. Flutter is a stable, performing and productive framework.

> #### Certainly to be taken into consideration for many aspects and if your app don’t require much from hardware but that certainly will not completely replace native development.

If you want to learn more about Dart and Flutter the official documentation is really well structured and it’s a great place to start.

I hope that this tip will help you with your next mobile development. Before concluding I recommend you to like this post and leave a comment.

See you in the next tutorial. 😉
