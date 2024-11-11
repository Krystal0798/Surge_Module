let args = getArgs();
let requestUrl = `https://api.64clouds.com/v1/getServiceInfo?veid=${args.veid}&api_key=${args.api_key}`;

$httpClient.get(requestUrl, function(error, response, data){
    // 解析 JSON 数据
    let jsonData = JSON.parse(data);

    // 获取所需的数据
    let ipAddresses = jsonData.ip_addresses.map(ip => hideLastTwoDigits(ip)).join(', '); // Hide last two digits of each IP address
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
        `IP: ${ipAddresses}`,
        `Dosage：${bytesToSize(dataCounter)} | ${bytesToSize(planMonthlyData)}`,
        `Resets：${dataNextReset.getFullYear()}年${dataNextReset.getMonth() + 1}月${dataNextReset.getDate()}日`,
        `Plan: ${plan}`,
        `IDC: ${nodeDatacenter}`,
        `OS: ${os}`,
        `Disk: ${planDisk}`,
        `RAM: ${planRam}`
    ];
