!function(){var e={dependsOn:{"qx.Class":{usage:"dynamic",require:!0},"cv.ui.structure.AbstractWidget":{require:!0},"cv.ui.common.Update":{require:!0},"cv.parser.WidgetParser":{defer:"runtime"},"qx.io.request.Xhr":{},"qx.util.ResourceManager":{},"cv.Config":{},"cv.ui.structure.WidgetFactory":{defer:"runtime"}}};qx.Bootstrap.executePendingDefers(e);qx.Class.define("cv.plugins.Svg",{extend:cv.ui.structure.AbstractWidget,include:[cv.ui.common.Update],statics:{parse:function(e,t,r,s){var i=cv.parser.WidgetParser.parseElement(this,e,t,r,s);cv.parser.WidgetParser.parseFormat(e,t);cv.parser.WidgetParser.parseAddress(e,t);return i}},members:{_getInnerDomString:function(){return'<div class="actor"></div>'},_onDomReady:function(){cv.plugins.Svg.prototype._onDomReady.base.call(this);var e=new qx.io.request.Xhr(qx.util.ResourceManager.getInstance().toUri("plugins/svg/rollo.svg"));e.set({accept:"text/plain",cache:!cv.Config.forceReload});e.addListenerOnce("success",function(e){var t=e.getTarget();this.getActor().innerHTML=t.getResponseText()},this);e.send()},_update:function(e,t){t=this.defaultValueHandling(e,t);var r,s,i,a=this.getActor();for(s=0,i=Math.floor(t/12);s<=i;s++){(r=a.querySelector("#line"+(s+1))).setAttribute("y1",9+4*s+t%12/12*4);r.setAttribute("y2",9+4*s+t%12/12*4)}for(s=Math.floor(t/12)+1;s<=12;s++){(r=a.querySelector("#line"+(s+1))).setAttribute("y1",9);r.setAttribute("y2",9)}}},defer:function(e){cv.parser.WidgetParser.addHandler("svg",cv.plugins.Svg);cv.ui.structure.WidgetFactory.registerClass("svg",e)}});cv.plugins.Svg.$$dbClassInfo=e}();
//# sourceMappingURL=part-18.js.map