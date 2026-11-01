/* Choisit le manifeste avant que le navigateur ne décide d'installer : /admin = application d'administration, le reste = le site. */
(function () {
  if (location.pathname !== "/admin" && location.pathname.indexOf("/admin/") !== 0) return;
  var set = function (sel, attr, value) {
    var el = document.querySelector(sel);
    if (el) el.setAttribute(attr, value);
  };
  set('link[rel="manifest"]', "href", "/admin.webmanifest");
  set('link[rel="apple-touch-icon"]', "href", "/admin-apple-touch-icon.png");
  set('meta[name="theme-color"]', "content", "#4a0f22");
  set('meta[name="apple-mobile-web-app-title"]', "content", "LMD Admin");
})();
