// serverinfo_traffic.js
// 直接调用 /api/traffic，展示 CPU/内存、实时流量、总流量、IP 纯净度

const args = Object.fromEntries(
  ($argument || "")
    .split("&")
    .filter(Boolean)
    .map(kv => kv.split("=").map(decodeURIComponent))
);

const url = args.url || "http://你的VPSIP:7122/api/traffic";
const name = args.name || "Server Info";
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

  try {
    const j = JSON.parse(data);

    const cpu = j.cpu_usage;
    const mem = j.mem_usage;
    const upMbps = j.up_speed_mbps != null ? j.up_speed_mbps.toFixed(2) : "N/A";
    const downMbps = j.down_speed_mbps != null ? j.down_speed_mbps.toFixed(2) : "N/A";

    const totalGB = (j.bytes_total / 1024 / 1024 / 1024).toFixed(2);
    const uptimeSec = j.uptime;
    const hours = Math.floor(uptimeSec / 3600);
    const days = Math.floor(hours / 24);

    let trafficStatus = j.traffic_level || "unknown";
    let trafficEmoji = "⚪️";
    if (trafficStatus === "idle") trafficEmoji = "🟢";
    else if (trafficStatus === "normal") trafficEmoji = "🟡";
    else if (trafficStatus === "busy") trafficEmoji = "🔴";

    const ipInfo = j.ip_info || {};
    const ip = ipInfo.ip || "未知";
    const isp = ipInfo.isp || "";
    const purity = ipInfo.purity_level || "unknown";
    const purityDesc = ipInfo.purity_desc || "";

    let purityEmoji = "⚪️";
    if (purity === "high") purityEmoji = "🟢";
    else if (purity === "low") purityEmoji = "🔴";
    else purityEmoji = "🟡";

    const line1 = `CPU: ${cpu}%  MEM: ${mem}%`;
    const line2 = `⬆️ ${upMbps} Mbps   ⬇️ ${downMbps} Mbps  ${trafficEmoji} ${trafficStatus}`;
    const line3 = `总流量: ${totalGB} GB   运行: ${days}天`;
    const line4 = `IP: ${ip}`;
    const line5 = `${purityEmoji} 纯净度: ${purity}  ${isp}`;

    const content = [line1, line2, line3, line4, line5].join("\n");

    $done({
      title: name,
      content: content,
      icon: icon
    });
  } catch (e) {
    $done({
      title: name,
      content: "解析失败: " + e,
      icon: "exclamationmark.triangle"
    });
  }
});
