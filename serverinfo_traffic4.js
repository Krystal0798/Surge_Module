// 单 VPS 面板：本月流量 + 纯净度(本地 high/low) + 磁盘 + 进程 + loadavg
// 内存颜色：0~1% 绿，1~30% 黄，30~70% 绿，70以上 红

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

  const cpu = j.cpu_usage;
  const mem = j.mem_usage;

  // 内存颜色规则
  let memEmoji = "🟢";
  if (typeof mem === "number") {
    if (mem >= 70) memEmoji = "🔴";
    else if (mem > 30) memEmoji = "🟢";
    else if (mem > 1) memEmoji = "🟡";
    else memEmoji = "🟢";
  }

  const upVal = typeof j.up_mbps === "number" ? j.up_mbps.toFixed(2) : "0.00";
  const downVal = typeof j.down_mbps === "number" ? j.down_mbps.toFixed(2) : "0.00";

  const uptime = j.uptime_human || "";

  // 本月流量
  const monthTotalBytes = j.month_bytes_total != null ? j.month_bytes_total : j.bytes_total;
  const totalGB = (monthTotalBytes / 1024 / 1024 / 1024).toFixed(2);

  // 流量状态
  let trafficEmoji = "⚪️";
  if (j.traffic_level === "idle") trafficEmoji = "🟢";
  else if (j.traffic_level === "normal") trafficEmoji = "🟡";
  else if (j.traffic_level === "busy") trafficEmoji = "🔴";

  // IP 纯净度（本地 high/low/unknown）
  const ipInfo = j.ip_info || {};
  const ip = ipInfo.ip || "未知";
  const purity = ipInfo.purity_level || "unknown";
  let purityEmoji = "🟡";
  if (purity === "high") purityEmoji = "🟢";
  else if (purity === "low") purityEmoji = "🔴";

  // 磁盘三色
  const disk = j.disk || {};
  const usedGB = disk.used_gb != null ? disk.used_gb : "N/A";
  const totalDiskGB = disk.total_gb != null ? disk.total_gb : "N/A";
  const dPercent = disk.percent != null ? disk.percent : 0;

  let diskEmoji = "🟢";
  if (dPercent >= 90) diskEmoji = "🔴";
  else if (dPercent >= 70) diskEmoji = "🟡";

  // 进程 + loadavg
  const proc = j.process_count != null ? j.process_count : "N/A";
  const la = j.loadavg || {};
  const loadStr = (la["1"] != null && la["5"] != null && la["15"] != null)
    ? `${la["1"]}/${la["5"]}/${la["15"]}`
    : "N/A";

  // 👇 这里已经完全去掉 sysLine / cpuInfoLine 不再显示系统信息

  const line1 = `CPU: ${cpu}%   MEM: ${mem}% ${memEmoji}`;
  const line2 = `⬆️ ${upVal} Mbps   ⬇️ ${downVal} Mbps   ${trafficEmoji}`;
  const line3 = `本月流量: ${totalGB} GB   运行: ${uptime}`;
  const line4 = `IP: ${ip}`;
  const line5 = `${purityEmoji} 纯净度: ${purity}`;
  const line6 = `${diskEmoji} 磁盘: ${usedGB}/${totalDiskGB} GB (${dPercent}%)`;
  const line7 = `进程: ${proc}   Load: ${loadStr}`;

  const content = [line1, line2, line3, line4, line5, line6, line7]
    .filter(Boolean)
    .join("\n");

  $done({ title: name, content, icon });
});
