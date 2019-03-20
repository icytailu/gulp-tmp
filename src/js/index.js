$(function() {
  // 适用于全局方法
  var util = {
    // 阻止冒泡方法
    stopBubble: function(e) {
      //如果提供了事件对象，则这是一个非IE浏览器
      if (e && e.stopPropagation) {
        //因此它支持W3C的stopPropagation()方法
        e.stopPropagation();
        //否则，我们需要使用IE的方式来取消事件冒泡
      } else {
        window.event.cancelBubble = true;
      }
    }
  };
  commonInit();
  function commonInit() {
    // 点击三条杠显示隐藏移动端导航
    showMobileNav();
  }
  // 点击三条杠显示隐藏移动端导航
  function showMobileNav() {
    console.log("change");
  }
  // 只会在首页执行的方法
  if (location.pathname == "/") {
    homeInitPage();

    function homeInitPage() {
      // 监听窗口变化
      windowResize();
    }
    // 窗口改变所执行的方法
    function windowResize() {
      window.addEventListener("resize", function() {
        // var resizeTimer;
        // if ($(document).width() < 768) {
        // clearTimeout(resizeTimer);
        // resizeTimer = setTimeout(initFullPage, 300);
        // }
        console.log("window-change");
      });
    }
  }
});
