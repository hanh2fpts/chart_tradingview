import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class ChartPage extends StatefulWidget {
  const ChartPage({super.key});

  @override
  State<ChartPage> createState() => _ChartPageState();
}

class _ChartPageState extends State<ChartPage> {
  @override
  void initState() {
    print('init chart page');
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(),
        body: Center(
          child: InAppWebView(
            initialUrlRequest: URLRequest(
                url: Uri.parse("http://localhost:8080/assets/charting_library1/chart_white.html")),
            androidOnPermissionRequest: (controller, origin, resources) async {
              return PermissionRequestResponse(
                  resources: resources, action: PermissionRequestResponseAction.GRANT);
            },
            onWebViewCreated: (controller) {
              //String script = "setEnvironment(\"VNINDEX\", \"VI\");";
              //controller.evaluateJavascript(source: script);
            },
            onLoadStart: (controller, url) {
              print('loadStart $url');
            },
            onLoadStop: (controller, url) {
              String script = "setEnvironment(\"VNINDEX\", \"VI\");";
              controller.evaluateJavascript(source: script);
              //_controller = controller;
              print('loadStop $url');
            },
            onConsoleMessage: (controller, message) {
              print('logWeb ${message.message}');
            },
          ),
        ));
  }
}
