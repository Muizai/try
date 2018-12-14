var designW = 750,
    winW = document.documentElement.clientWidth,
    ratio = winW / designW,
    oMain = document.getElementById("main");
  if (winW > designW) {
    oMain.style.width = designW + "px";
    oMain.style.margin = '0 auto';
  } else {
    document.documentElement.style.fontSize = ratio * 100 + "px";

  };