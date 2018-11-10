const { join } = require('path')
const QuickgRPC = require('quick-grpc')

async function go () {
  const { payment } = await new QuickgRPC({
    host: 'localhost:9105',
    basePath: join(__dirname, '..', '..', 'payment', 'protos')
  })

  let pay = await payment()
  pay.info(undefined, function (err, data) {
    if (err) throw err
    console.log(JSON.stringify(data, null, 2))
  })
}

go()
