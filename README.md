# fword-redis

Redis的学习笔记

## 基础使用

Redis的五种基本数据类型：string、hash、list、set、zset

### string

操作：get、set、exists、del

最大长度为512M

### hash

hash是数组+链表的二维结构

rehash时采用的是渐进式rehash

操作：hget、hset、hgetall、hlen、hmset、hincrby

### list

list是双向链表、数据量少时是ziplist，数据量大时是quicklist

操作：rpush、rpop、lpush、lpop、lindex（复杂度O（n））、lrange、ltrim、llen

list可以实现队列、堆栈

### set

set内部用字典实现，只不过value为null

操作：sadd、smembers、scard、spop

### zset

zset一方面保证了元素的唯一性，另一方面给每个值加上了score代表排序的权重，内部是以跳跃表实现的

操作：zadd、zrange、zrevrange、zrangebyscore、zrem

### 分布式锁

使用setnx占坑、del释放坑来实现分布式锁，同时还要添加过期时间expire，expire和setnx不是原子操作

使用`set key true ex 5 nx`来实现原子操作

### 位图

### HyperLogLog

HyperLogLog可以用来统计UV，占用空间小，结果不太准确

指令：pfadd、pfcount

pfmerge可以将多个pf值合并，统计多个页面的UV

占用空间为12K

### 布隆滤波器

布隆滤波器类似于一个set，可以判断一个元素是否在一个集合内，但是是不太准确的，判断不在一个集合时这个元素则一定不在这个集合，而判断在时有可能误判。

可以应用在类似推送消息去重。

创建一个布隆滤波器时指定三个参数：key、error_rate(错误率)、initial_size(预计数量)

错误率设置越低，所需空间越大

原理是采用一个位数组以及几个无偏的hash函数，add元素时将算出来的几个位置置1，判断是否存在时也是算出位置看位置是否都是1，所以有可能判断出来存在但实际上是不存在的。

### GeoHash

在算附近的人时可以用到

### scan

获取特定模式的key，使用keys + pattern

复杂度是O（n），数据量大的话，会造成卡顿，而且一下子取出的是所有的数据。

采用scan命令通过游标分步获取数据

命令的格式是：scan "cursor" match "pattern" count "limit"

实际返回的limit限定的是一次扫描的槽位，当返回为空时不意味着遍历完毕，等到返回的cursor值为0时，遍历完毕。

采用的是高位进位加法来遍历，防止字典扩容或者缩容造成的影响。


