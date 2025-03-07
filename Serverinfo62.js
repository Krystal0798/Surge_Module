let args = getArgs();
let requestUrl = `https://api.64clouds.com/v1/getServiceInfo?veid=${args.veid}&api_key=${args.api_key}`;

$httpClient.get(requestUrl, function(error, response, data){
    // 解析 JSON 数据
    let jsonData;
    try {
        jsonData = JSON.parse(data);
    } catch (e) {
        $done({
            title: "Error",
            content: "Invalid JSON response",
            icon: "exclamationmark.triangle",
            "icon-color": "#e74c3c"
        });
        return;
    }

    // 获取所需的数据
    let ipAddresses = jsonData.ip_addresses;

    let ipv4List = ipAddresses.filter(ip => ip.includes('.')).join(', '); // 过滤出 IPv4
    let ipv6List = ipAddresses.filter(ip => ip.includes(':')).join(', '); // 过滤出 IPv6

    let ipDisplay = `IP: ${ipv4List}`;
    if (ipv6List) {
        ipDisplay += `\nIPv6: ${ipv6List}`; // IPv6 另起一行
    }

    let nodeDatacenter = jsonData.node_datacenter;
    let os = jsonData.os;
    let plan = jsonData.plan;
    let planRam = bytesToSize(jsonData.plan_ram);
    let planDisk = bytesToSize(jsonData.plan_disk);
    let dataCounter = jsonData.data_counter * jsonData.monthly_data_multiplier;
    let dataNextReset = new Date(jsonData.data_next_reset * 1000);
    let planMonthlyData = jsonData.plan_monthly_data * jsonData.monthly_data_multiplier;

    // 格式化内容
    let content = [
        ipDisplay,
        `Dosage：${bytesToSize(dataCounter)} | ${bytesToSize(planMonthlyData)}`,
        `Resets：${dataNextReset.getFullYear()}年${dataNextReset.getMonth() + 1}月${dataNextReset.getDate()}日`,
        `Plan: ${plan}`,
        `IDC: ${nodeDatacenter}`,
        `OS: ${os}`,
        `Disk: ${planDisk}`,
        `RAM: ${planRam}`
    ];

    let now = new Date();
    let hour = now.getHours();
    let minutes = now.getMinutes();
    hour = hour > 9 ? hour : "0" + hour;
    minutes = minutes > 9 ? minutes : "0" + minutes;

    $done({
        title: `𝐁𝐚𝐧𝐝𝐰𝐚𝐠𝐨𝐧  𝑰𝒏𝒇𝒐 |  𝐑𝐮𝐧𝐭𝐢𝐦𝐞:  ${hour}:${minutes}`,
        content: content.join("\n"),
        icon: "server.rack",
        "icon-color": "#3498db",
    });
});

function getArgs() {
    if (!$argument) return {};
    return Object.fromEntries(
        $argument.split("&").map((item) => item.split("="))
    );
}

function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}
