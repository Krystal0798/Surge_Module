$httpAPI("POST", "/v1/profiles/reload", {}, data => {
    $notification.post("配置重載","成功","")
    $done({
        title: "𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝗥𝗲𝗹𝗼𝗮𝗱",
        content: "配置檔案重載成功",
        icon: "arrow.triangle.2.circlepath.doc.on.clipboard",
        "icon-color": "#8B81C3",
     })
    });
