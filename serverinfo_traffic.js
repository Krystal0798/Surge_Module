// 单 VPS 面板：IPLark 纯净度数值 + 颜色，三色磁盘，进程数，loadavg

const args = Object.fromEntries(
  ($argument || "")
    .split("&")
    .filter(Boolean)
    .map(kv => kv.split("=").map(decodeURIComponent))
);

const url = args.url;
const name = args.name || "Server";
const icon = args.icon || "server.rack";

$httpClient.get(url, function (error, response, data) {
  if (error) {
    $done({
      title: name,
      content: "请求失败: " + error,
      icon: "exclamationmark.triangle"
    });
    return;
  }

  let j;
  try {
    j = JSON.parse(data);
  } catch (e) {
    $done({
      title: name,
      content: "解析失败: " + e,
      icon: "exclamationmark.triangle"
    });
    return;
  }

  // 基本数据
  const cpu = j.cpu_usage;
  const mem = j.mem_usage;
  const up = j.up_mbps;
  const down = j.down_mbps;
  const totalGB = (j.bytes_total / 1024 / 1024 / 1024).toFixed(2);
  const uptime = j.uptime_human || "";

  // 流量状态
  let trafficEmoji = "⚪️";
  if (j.traffic_level === "idle") trafficEmoji = "🟢";
  else if (j.traffic_level === "normal") trafficEmoji = "🟡";
  else if (j.traffic_level === "busy") trafficEmoji = "🔴";

  // IP & 纯净度（IPLark）
  const ip = j.ip || "未知";
  const iplark = j.iplark || {};
  let purityScore = j.purity_score;
  if (purityScore == null && iplark && iplark.score != null) {
    purityScore = iplark.score;
  }
  if (purityScore == null) purityScore = 50; // 默认值兜底

  let purityEmoji = "🟡";
  if (purityScore > 80) purityEmoji = "🟢";
  else if (purityScore < 40) purityEmoji = "🔴";

  // 磁盘三色
  const disk = j.disk || {};
  const dPercent = disk.percent || 0;
  let diskEmoji = "🟢";
  if (dPercent >= 90) diskEmoji = "🔴";
  else if (dPercent >= 70) diskEmoji = "🟡";

  // 进程数 + loadavg
  const proc = j.process_count != null ? j.process_count : "N/A";
  const la = j.loadavg || {};
  const loadStr = (la["1"] != null && la["5"] != null && la["15"] != null)
    ? `${la["1"]}/${la["5"]}/${la["15"]}`
    : "N/A";

  // 系统信息（可选显示）
  const sys = j.system || {};
  const sysLine = sys.os ? `${sys.os} | ${sys.kernel || ""}` : "";
  const cpuInfoLine = sys.cpu_model ? `${sys.cpu_model} | RAM ${sys.mem_total_gb} GB` : "";

  // 组装展示内容
  const line1 = `CPU: ${cpu}%   MEM: ${mem}%`;
  const line2 = `⬆️ ${up} Mbps   ⬇️ ${down} Mbps   ${trafficEmoji} ${j.traffic_level}`;
  const line3 = `总流量: ${totalGB} GB   运行: ${uptime}`;
  const line4 = `IP: ${ip}`;
  const line5 = `${purityEmoji} 纯净度: ${purityScore}/100`;
  const line6 = `${diskEmoji} 磁盘: ${disk.used_gb}/${disk.total_gb} GB (${dPercent}%)`;
  const line7 = `进程: ${proc}   Load: ${loadStr}`;
  const line8 = sysLine;
  const line9 = cpuInfoLine;

  const content = [line1, line2, line3, line4, line5, line6, line7, line8, line9]
    .filter(Boolean)
    .join("\n");

  $done({
    title: name,
    content: content,
    icon: icon
  });
});
