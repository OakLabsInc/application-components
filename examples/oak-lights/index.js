const { join } = require('path')
const QuickgRPC = require('quick-grpc')

async function go () {
  const { oakLights } = await new QuickgRPC({
    host: 'localhost:9100',
    basePath: join(__dirname, '..', '..', 'oak-lights')
  })
  let lights = await oakLights()
  lights.info(undefined, function (err, data) {
    if (err) throw err
    console.log(JSON.stringify(data, null, 2))
  })
}

go()
