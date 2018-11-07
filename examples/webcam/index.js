const { join } = require('path')
const QuickgRPC = require('quick-grpc')
const _ = require('lodash')

async function go () {
  const { webcam } = await new QuickgRPC({
    host: 'localhost:9101',
    basePath: join(__dirname, '..', '..', 'webcam')
  })

  let cam = await webcam()
  cam.info(undefined, function (err, data) {
    if (err) throw err
    console.log(`* webcams (${data.webcams.length})`)
    data.webcams.forEach(v => console.log(v))
  })
}

go()