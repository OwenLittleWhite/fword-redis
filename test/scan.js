/**
 * 布隆滤波器
 */

const redis = require('redis');

const client = redis.createClient();

for (let index = 0; index < 10000; index++) {
   client.set(`key${index}`, index)
  
}

