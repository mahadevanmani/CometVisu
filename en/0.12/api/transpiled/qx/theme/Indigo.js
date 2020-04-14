(function () {
  var $$dbClassInfo = {
    "dependsOn": {
      "qx.Theme": {
        "usage": "dynamic",
        "require": true
      },
      "qx.theme.indigo.Color": {
        "require": true
      },
      "qx.theme.indigo.Decoration": {
        "require": true
      },
      "qx.theme.indigo.Font": {
        "require": true
      },
      "qx.theme.indigo.Appearance": {
        "require": true
      },
      "qx.theme.icon.Tango": {
        "require": true
      }
    }
  };
  qx.Bootstrap.executePendingDefers($$dbClassInfo);

  /* ************************************************************************
  
     qooxdoo - the new era of web development
  
     http://qooxdoo.org
  
     Copyright:
       2004-2011 1&1 Internet AG, Germany, http://www.1und1.de
  
     License:
       MIT: https://opensource.org/licenses/MIT
       See the LICENSE file in the project's top-level directory for details.
  
     Authors:
       * Martin Wittemann (martinwittemann)
       * Tristan Koch (trkoch)
  
  ************************************************************************ */

  /**
   * Simple Theme
   */
  qx.Theme.define("qx.theme.Indigo", {
    title: "Indigo",
    meta: {
      color: qx.theme.indigo.Color,
      decoration: qx.theme.indigo.Decoration,
      font: qx.theme.indigo.Font,
      appearance: qx.theme.indigo.Appearance,
      icon: qx.theme.icon.Tango
    }
  });
  qx.theme.Indigo.$$dbClassInfo = $$dbClassInfo;
})();

//# sourceMappingURL=Indigo.js.map?dt=1586896762892