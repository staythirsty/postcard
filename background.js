chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('app/index.html', {
    'bounds': {
      'width': 800,
      'height': 800
    },
    frame: 'none'
  });
});