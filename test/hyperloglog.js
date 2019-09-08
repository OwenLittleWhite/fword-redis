/**
 * test for hyperloglog
 */
const redis = require('redis');
const client = redis.createClient();

function pfadd(key, value) {
  return new Promise((resolve, reject) => {
    client.pfadd(key, value, function (err, resp) {
      if (err) {
        reject(err)
      } else {
        resolve(resp)
      }
    })
  })

}

async function add() {
  for (let i = 0; i < 100000; i++) {
    await pfadd('key', i)
  }
}

add().then(() => {
  client.pfcount('key', function (err, resp) {
    console.log(err, resp)
    process.exit(0)
  })
})
