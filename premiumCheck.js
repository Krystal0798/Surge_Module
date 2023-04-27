const BASE_URL = 'https://www.youtube.com/premium'

;(async () => {
  let result = {
    title: '𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗣𝗿𝗲𝗺𝗶𝘂𝗺 解鎖測試',
    icon: 'exclamationmark.arrow.triangle.2.circlepath',
    'icon-color':"#77428D",
    content: '測試失敗，請檢查網路狀態',
  }

  await test()
    .then((code) => {
      if (code === 'Not Available') {
        result['icon'] = 'xmark.shield'
        result['icon-color'] = "#CB1B45"
        result['content'] = '不支援解鎖 YouTube Premium'
        return
      }
      result['icon'] = "checkmark.shield"
      result['icon-color'] = '#1B813E'
      result['content'] = '支援解鎖 YouTube Premium\n解鎖國家：' + code
    })
    .finally(() => {
      $done(result)
    })
})()

function test() {
  return new Promise((resolve, reject) => {
    let option = {
      url: BASE_URL,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
        'Accept-Language': 'en',
      },
    }
    $httpClient.get(option, function (error, response, data) {
      if (error != null || response.status !== 200) {
        reject('Error')
        return
      }

      if (data.indexOf('Premium is not available in your country') !== -1) {
        resolve('Not Available')
        return
      }

      let region = ''
      let re = new RegExp('"countryCode":"(.*?)"', 'gm')
      let result = re.exec(data)
      if (result != null && result.length === 2) {
        region = result[1]
      } else if (data.indexOf('www.google.cn') !== -1) {
        region = 'CN'
      } else {
        region = 'US'
      }
      resolve(region)
    })
  })
}
