!function(){var t={dependsOn:{"qx.Class":{usage:"dynamic",require:!0},"cv.ui.structure.AbstractBasicWidget":{construct:!0,require:!0},"cv.parser.WidgetParser":{defer:"runtime"},"qx.event.Timer":{},"qx.event.Registration":{},"qx.event.message.Bus":{},"cv.TemplateEngine":{},"cv.ui.structure.WidgetFactory":{defer:"runtime"}}};qx.Bootstrap.executePendingDefers(t);qx.Class.define("cv.plugins.Timeout",{extend:cv.ui.structure.AbstractBasicWidget,construct:function(t){cv.ui.structure.AbstractBasicWidget.constructor.call(this,t);this.__timeoutIdleCount=0;this.__initialize()},statics:{parse:function(t,e,i,r){return cv.parser.WidgetParser.parseElement(this,t,e,i,r,this.getAttributeToPropertyMappings())},getAttributeToPropertyMappings:function(){return{target:{default:"id_"},time:{default:600,transform:parseFloat},debug:{default:!1,transform:function(t){return"true"===t}}}}},properties:{target:{check:"String",init:"id_"},time:{check:"Number",init:600},debug:{check:"Boolean",init:!1}},members:{__timeoutIdleCount:null,__timeoutCurrentPage:null,__timeoutCurrentPageTitle:null,__timeoutTargetPage:null,__timer:null,__initialize:function(){if(this.isDebug()){this.debug("Timeout Set to : "+this.getTime());this.debug("Target Page: "+this.getTarget())}var t=100*this.getTime();this.__timer=new qx.event.Timer(t);this.__timer.addListener("interval",this.timeoutTrigger,this);this.__timer.start();qx.event.Registration.addListener(window,"useraction",this._onUserAction,this);qx.event.message.Bus.subscribe("path.pageChanged",function(t){var e=t.getData();this.__timeoutCurrentPage=e;this.__timeoutCurrentPageTitle=document.querySelector("#"+e+" div > h1").innerText;this.__timeoutIdleCount=0},this)},_onUserAction:function(){this.__timeoutIdleCount=0},timeoutTrigger:function(){this.isDebug()&&this.debug("TIMEOUT: Got Trigger ("+this.__timeoutIdleCount+")");this.__timeoutIdleCount++;this.__timeoutTargetPage=this.getTarget();if(this.__timeoutIdleCount>=10){this.__timeoutIdleCount=0;var t=cv.TemplateEngine.getInstance();if(this.__timeoutCurrentPage!==this.__timeoutTargetPage&&this.__timeoutCurrentPageTitle!==this.__timeoutTargetPage){this.isDebug()&&this.debug("TIMEOUT: Got Timeout - Now Goto Page "+this.__timeoutTargetPage);t.scrollToPage(this.__timeoutTargetPage);t.getCurrentPage().getDomElement().scrollTop=0}else{this.isDebug()&&this.debug("TIMEOUT: Already on page "+this.__timeoutTargetPage);t.getCurrentPage().getDomElement().scrollTop=0}}}},destruct:function(){this._disposeObjects("__timer")},defer:function(t){cv.parser.WidgetParser.addHandler("timeout",cv.plugins.Timeout);cv.ui.structure.WidgetFactory.registerClass("timeout",t)}});cv.plugins.Timeout.$$dbClassInfo=t}();
//# sourceMappingURL=part-16.js.map