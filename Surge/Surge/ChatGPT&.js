/*
作者：keywos wuhu@wuhu_zzz 整点猫咪
改动：
- 去除 Warp 相关逻辑
- GPT 文案仅 ✔️ / ✖️
- 标题自动去掉“状态”两字，并把 ChatGPT 美化为 𝓒𝓱𝓪𝓽𝓖𝓟𝓣
- 区域只显示国旗
- 将 Country 改为 Ctry
*/

let url = "http://chat.openai.com/cdn-cgi/trace";

// 支持 ChatGPT 的地区代码列表
let tf = [
  "T1","XX","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ","BS","BD","BB","BE","BZ","BJ","BT","BA","BW","BR","BG","BF","CV",
  "CA","CL","CO","KM","CR","HR","CY","DK","DJ","DM","DO","EC","SV","EE","FJ","FI","FR","GA","GM","GE","DE","GH","GR","GD","GT",
  "GN","GW","GY","HT","HN","HU","IS","IN","ID","IQ","IE","IL","IT","JM","JP","JO","KZ","KE","KI","KW","KG","LV","LB","LS","LR",
  "LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR","MU","MX","MC","MN","ME","MA","MZ","MM","NA","NR","NP","NL","NZ","NI",
  "NE","NG","MK","NO","OM","PK","PW","PA","PG","PE","PH","PL","PT","QA","RO","RW","KN","LC","VC","WS","SM","ST","SN","RS","SC",
  "SL","SG","SK","SI","SB","ZA","ES","LK","SR","SE","CH","TH","TG","TO","TT","TN","TR","TV","UG","AE","US","UY","VU","ZM","BO",
  "BN","CG","CZ","VA","FM","MD","PS","KR","TW","TZ","TL","GB"
];

// 处理 argument 参数
let titlediy, icon, iconerr, iconColor, iconerrColor;
if (typeof $argument !== 'undefined') {
  const args = $argument.split('&');
  for (let i = 0; i < args.length; i++) {
    const [key, value] = args[i].split('=');
    if (key === 'title') {
      titlediy = value;
    } else if (key === 'icon') {
      icon = value;
    } else if (key === 'iconerr') {
      iconerr = value;
    } else if (key === 'icon-color') {
      iconColor = value;
    } else if (key === 'iconerr-color') {
      iconerrColor = value;
    }
  }
}

// 发送 HTTP 请求获取所在地信息
$httpClient.get(url, function(error, response, data) {
  if (error) {
    console.error(error);
    $done();
    return;
  }

  let lines = data.split("\n");
  let cf = lines.reduce((acc, line) => {
    let [key, value] = line.split("=");
    acc[key] = value;
    return acc;
  }, {});

  let locCode = (cf.loc || "").toUpperCase();
  let loc = getCountryFlagEmoji(locCode);

  let supported = tf.indexOf(locCode) !== -1;
  let gpt, iconUsed, iconCol;

  if (supported) {
    gpt = "GPT: ✔️";
    iconUsed = icon || undefined;
    iconCol = iconColor || undefined;
  } else {
    gpt = "GPT: ✖️";
    iconUsed = iconerr || undefined;
    iconCol = iconerrColor || undefined;
  }

  let finalTitle = titlediy ? titlediy.replace(/状态/g, "") : "ChatGPT";
  finalTitle = finalTitle.replace(/ChatGPT/g, "𝓒𝓱𝓪𝓽𝓖𝓟𝓣");

  let body = {
    title: finalTitle,
    content: `${gpt}       Ctry: ${loc}`,  // ★ 已替换为 Ctry
    icon: iconUsed,
    'icon-color': iconCol
  };

  $done(body);
});

// 获取国旗 Emoji 函数
function getCountryFlagEmoji(countryCode) {
  if (countryCode.toUpperCase() == 'TW') {
    countryCode = 'CN';
  }
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
