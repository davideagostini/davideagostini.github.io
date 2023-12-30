---
author: Davide Agostini
pubDatetime: 2021-03-24T10:25:54.547Z
title: Create a Bouncing Button Animation in Flutter
slug: create-a-bouncing-button-animation-in-flutter
featured: true
ogImage: https://github.com/satnaing/astro-paper/assets/53733092/1ef0cf03-8137-4d67-ac81-84a032119e3a
tags:
  - coding
  - flutter
description: "Add animations to your applications enriches the general user experience."
---

In Flutter creating animations is very simple and intuitive. In this case you will learn how to create a bouncing button animation working with controllers and values.

The final result of the tutorial

![Bouncing Button Preview](/assets/bouncing-button-preview.gif)

**AnimationController** class lets you perform tasks such as:

- Play an animation `forward` on in `reverse`, or stop an animation;
- Set the animation to a specific value;
- Define the `upperBound` and `lowerBound` values of an animation;

AnimationController produces values that range from 0.0 to 1.0. during a given duration.

## Ticker providers

An AnimationController needs a **TickerProvider**, which is configured using the `vsync` argument on the constructor.

The TickerProvider interface describes a factory for Ticker objects. A Ticker is an object that knows how to register itself with the <em>SchedulerBinding</em> and fires a callback every frame.

The AnimationController class uses a Ticker to step through the animation that it controls.

If an AnimationController is being created from a State, then the State can use the `TickerProviderStateMixin` and `SingleTickerProviderStateMixin` classes to implement the TickerProvider interface.

The TickerProviderStateMixin class always works for this purpose; the SingleTickerProviderStateMixin is slightly more efficient in the case of the class only ever needing one Ticker.

### AnimationWidget

```dart
class AnimatedButton extends AnimatedWidget {
  final AnimationController _controller;
  const AnimatedButton({
    @required AnimationController controller,
  })  : _controller = controller,
        super(listenable: controller); // (a).

  @override
  Widget build(BuildContext context) {
    return Transform.scale( // (b).
      scale: 1 - _controller.value, // (c).
      child: Container(
        height: 70,
        width: 200,
        decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20.0),
            boxShadow: const [
              BoxShadow(
                color: Color(0x80000000),
                blurRadius: 10.0,
                offset: Offset(0.0, 2.0),
              ),
            ],
            gradient: LinearGradient(
              colors: const [
                Color(0xff00e6dc),
                Color(0xff00ffb9),
              ],
            )),
        child: const Center(
          child: Text('Press button',
              style: TextStyle(
                fontSize: 20.0,
                fontWeight: FontWeight.bold,
                color: Color(0xff000028),
              )),
        ),
      ),
    );
  }
}
```

The layout button is based on a `Container` with a text widget. The button has border radius and a linear gradient style.

- (a) The listenable object is passed via constructor following the good dependency injection practices.
- (b) `Transform.scale()` constructor returns a scaled widget with a scale of given value.
- (c) `_controller.value` constantly changes and the widget is rebuilt so that you see the bouncing effect on the widget button.

### Bouncing Button Widget

```dart
class BouncingButton extends StatefulWidget {
  @override
  _BouncingButtonState createState() => _BouncingButtonState();
}

class _BouncingButtonState extends State<BouncingButton>
    with SingleTickerProviderStateMixin {
  AnimationController _controller;

  @override
  void initState() {
    _controller = AnimationController( // (a).
      vsync: this, // (b).
      duration: Duration(
        milliseconds: 500,
      ),
      lowerBound: 0.0,
      upperBound: 0.1,
    )..addListener(() { // (c).
        setState(() {});
      });
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
    // (d).
    _controller.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Text(
            'Bouncing Button Animation',
            style: TextStyle(color: Colors.grey[700], fontSize: 20.0),
          ),
          const SizedBox(
            height: 20.0,
          ),
          Center(
            child: GestureDetector(
              onTapDown: _tapDown,
              onTapUp: _tapUp,
              child: AnimatedButton(controller: _controller),
            ),
          ),
        ],
      ),
    );
  }

  // (e).
  void _tapDown(TapDownDetails details) {
    _controller.forward();
  }

  // (f).
  void _tapUp(TapUpDetails details) {
    _controller.reverse();
  }
}
```

- (a) `AnimationController` class generate a series of values for a given duration. By default a controller emits value from 0 to 1 with a linear interval. Our animated widget receives them and gets rebuilt.
- (b) The `vsync` parameter of the controller prevents offscreen animations from consuming unnecessary resources. Initializing it with `this` gives the stateful widget the possibility to handling the animation resources automatically.
- (c) `addListener()` calls the listener every time the value of the animation changes.
- (d) An AnimationController should be disposed when it is non longer needed. This reduces the likelihood of leaks. When used with a StatefulWidget, it is common for an AnimationController to be created in the `initState()` method and then disposed in the `dispose()` method.
- (e) `_tapDown()` is a function used when the button is tapped down. `forward()` starts the animation forward, in the sense that values vary from start to the end.
- (f) `_tapUp()` is a function used when the button is released. `reverse()` starts the animation reverse, in the sense that values vary from the end to the start.

## The full code

```dart
import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: BouncingButton(),
    );
  }
}

class BouncingButton extends StatefulWidget {
  @override
  _BouncingButtonState createState() => _BouncingButtonState();
}

class _BouncingButtonState extends State<BouncingButton>
    with SingleTickerProviderStateMixin {
  AnimationController _controller;

  @override
  void initState() {
    _controller = AnimationController(
      vsync: this,
      duration: Duration(
        milliseconds: 500,
      ),
      lowerBound: 0.0,
      upperBound: 0.1,
    )..addListener(() {
        setState(() {});
      });
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
    _controller.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Text(
            'Bouncing Button Animation',
            style: TextStyle(color: Colors.grey[700], fontSize: 20.0),
          ),
          const SizedBox(
            height: 20.0,
          ),
          Center(
            child: GestureDetector(
              onTapDown: _tapDown,
              onTapUp: _tapUp,
              child: AnimatedButton(controller: _controller),
            ),
          ),
        ],
      ),
    );
  }

  void _tapDown(TapDownDetails details) {
    _controller.forward();
  }

  void _tapUp(TapUpDetails details) {
    _controller.reverse();
  }
}

class AnimatedButton extends AnimatedWidget {
  final AnimationController _controller;
  const AnimatedButton({
    @required AnimationController controller,
  })  : _controller = controller,
        super(listenable: controller);

  @override
  Widget build(BuildContext context) {
    return Transform.scale(
      scale: 1 - _controller.value,
      child: Container(
        height: 70,
        width: 200,
        decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20.0),
            boxShadow: const [
              BoxShadow(
                color: Color(0x80000000),
                blurRadius: 10.0,
                offset: Offset(0.0, 2.0),
              ),
            ],
            gradient: LinearGradient(
              colors: [
                Color(0xff00e6dc),
                Color(0xff00ffb9),
              ],
            )),
        child: const Center(
          child: Text('Press button',
              style: TextStyle(
                fontSize: 20.0,
                fontWeight: FontWeight.bold,
                color: Color(0xff000028),
              )),
        ),
      ),
    );
  }
}
```

I hope that this tip will help you for your next mobile development.

See you in the next tutorial. 😉
