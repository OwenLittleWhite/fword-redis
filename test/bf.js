/**
 * 布隆滤波器
 */

const redis = require('redis');

const client = redis.createClient();

function bfadd(key, value) {
  return new Promise((resolve, reject) => {
    client.send_command(`bf.add ${key} ${value}`, function (err, resp) {
      if (err) {
        reject(err)
      } else {
        resolve(resp)
      }
    })
  })
}

async function add () {
  for(let i =0; i< 10000; i++) {
    await bfadd('user', i)
  }
}

add()
