package io.pics.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

import android.webkit.ServiceWorkerController;
import android.webkit.ServiceWorkerClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import com.capacitorjs.plugins.storage.StoragePlugin;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
  // @Override
  // public void onCreate(Bundle savedInstanceState) {
  //   super.onCreate(savedInstanceState);
  //   registerPlugin(StoragePlugin.class);

  //   // Initializes the Bridge
  //   this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
  //     add(GoogleAuth.class);
  //   }});
  // }
}
