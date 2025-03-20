let args = getArgs();
let requestUrl = `https://api.64clouds.com/v1/getServiceInfo?veid=${args.veid}&api_key=${args.api_key}`;

$httpClient.get(requestUrl, function (error, response, data) {
    if (error) {
        $done({
            title: "Bandwagon Info",
            content: "Failed to fetch data.",
            icon: "server.rack",
            "icon-color": "#FF0000",
        });
        return;
    }

    let jsonData;
    try {
        jsonData = JSON.parse(data);
    } catch (e) {
        $done({
            title: "Bandwagon Info",
            content: "Invalid JSON response.",
            icon: "server.rack",
            "icon-color": "#FF0000",
        });
        return;
    }

    // 直接显示完整 IP 地址
    let ipAddresses = jsonData.ip_addresses ? jsonData.ip_addresses.join(', ') : "N/A";
    let nodeDatacenter = jsonData.node_datacenter || "Unknown";
    let os = jsonData.os || "Unknown";
    let plan = jsonData.plan || "Unknown";

    // 处理 RAM、SWAP、磁盘、流量信息
    let ramUsed = jsonData.vm_ram_usage || 0; // 已使用 RAM
    let planRam = jsonData.plan_ram ? bytesToSize(jsonData.plan_ram) : "Unknown"; // 总 RAM
    let swapUsed = jsonData.swap_usage || 0; // 已使用 SWAP
    let planSwap = jsonData.swap_total ? bytesToSize(jsonData.swap_total) : "Unknown"; // 总 SWAP
    let diskUsed = jsonData.vm_disk_usage || 0; // 已使用磁盘
    let planDisk = jsonData.plan_disk ? bytesToSize(jsonData.plan_disk) : "Unknown"; // 总磁盘
    let dataCounter = jsonData.data_counter ? jsonData.data_counter * (jsonData.monthly_data_multiplier || 1) : 0;
    let planMonthlyData = jsonData.plan_monthly_data ? jsonData.plan_monthly_data * (jsonData.monthly_data_multiplier || 1) : 0;
    let dataMultiplier = jsonData.monthly_data_multiplier || 1; // 流量倍率
    let dataNextReset = jsonData.data_next_reset ? new Date(jsonData.data_next_reset * 1000) : "N/A";

    // 计算使用百分比
    function calcPercentage(used, total) {
        if (!total || total === "Unknown") return "N/A";
        let percentage = (used / total) * 100;
        return percentage.toFixed(2) + "%";
    }

    // 计算并格式化流量使用信息（精确到两位小数）
    let formattedDataCounter = (dataCounter / (1024 * 1024 * 1024)).toFixed(2); // GB
    let formattedPlanMonthlyData = (planMonthlyData / (1024 * 1024 * 1024)).toFixed(2); // GB
    let bandwidthUsage = `${formattedDataCounter} GB / ${formattedPlanMonthlyData} GB (Multiplier: ×${dataMultiplier.toFixed(2)})`;

    let ramUsage = `${bytesToSize(ramUsed)} / ${planRam} (${calcPercentage(ramUsed, jsonData.plan_ram)})`;
    let swapUsage = `${bytesToSize(swapUsed)} / ${planSwap} (${calcPercentage(swapUsed, jsonData.swap_total)})`;
    let diskUsage = `${bytesToSize(diskUsed)} / ${planDisk} (${calcPercentage(diskUsed, jsonData.plan_disk)})`;

    // 格式化内容
    let content = [
        `IP: ${ipAddresses}`,
        `Datacenter: ${nodeDatacenter}`,
        `OS: ${os}`,
        `Plan: ${plan}`,
        `RAM: ${ramUsage}`,
        `SWAP: ${swapUsage}`,
        `Disk: ${diskUsage}`,
        `Bandwidth: ${bandwidthUsage}`,
        `Resets: ${dataNextReset instanceof Date ? `${dataNextReset.getFullYear()}-${dataNextReset.getMonth() + 1}-${dataNextReset.getDate()}` : "N/A"}`
    ];

    let now = new Date();
    let timeString = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    $done({
        title: `𝐁𝐚𝐧𝐝𝐰𝐚𝐠𝐨𝐧 𝑰𝒏𝒇𝒐 | 𝐑𝐮𝐧𝐭𝐢𝐦𝐞: ${timeString}`,
        content: content.join("\n"),
        icon: "server.rack",
        "icon-color": "#3498db",
    });
});

// 解析传入参数
function getArgs() {
    return Object.fromEntries(
        $argument
            .split("&")
            .map((item) => item.split("="))
    );
}

// 将字节转换为可读单位
function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}
