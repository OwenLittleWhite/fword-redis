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

## 原理

redis是单线程程序，通过非阻塞I/O事件轮询的方式并发处理客户端的请求。

### 持久化

Redis的持久化机制有两种，一种是快照，一种是AOF日志。

通过fork子进程来进行持久化，当正在复制时有新的修改操作则会将共享的数据复制一份对复制后的数据进行修改。

一般采用混合持久化，将快照恢复，然后在重播快照到当前时间之间的日志。

### 管道

将多条命令一起发送至服务端，在从服务端一同拿到数据，是由客户端实现的

### 事务

multi、exec、discard

可以保证事务隔离中的穿行化，一个事务中的命令执行过程中不会收到其他命令的打扰。

没有办法同时成功或者同时失败。

### pub/sub

可以使用pub和sub做消息队列进行订阅发布。

### 小对象压缩

当一个hash的结构数据量小时采用的就是ziplist，数据量大时升级为hashtable的结构。

### 集群

#### 主从同步

CAP原理：一致性、可用性、分区容忍性。当网络分区发生时，一致性和可用性两难全

采用增量复制的模式，将主节点修改的指令放入buffer 中将buffer同步给从节点。还有一种快照同步，主节点做一次快照备份，然后将快照同步给从节点，从节点加载快照。

#### Sentinel

sentinel会监控主从节点，主节点宕机后，会选择一个最优的从节点切换成主节点。

#### 分而治之

两种方式实现拓展，codis以及redis cluster

### 过期策略

Redis为每个设置了过期时间的key放入一个单独的字典中，定时遍历删除过期的key或者访问时惰性删除。

不要让大量的key同时过期，

LRU算法，在原先字典的基础上增加一个双向链表，元素访问过则放到链表头部，空间不够时将尾部的数据踢掉。

近似LRU算法，每个key增加一个字段表示最近访问的时间戳，当内存超过maxmemory时会随机选五个key将时间最小的淘汰掉，

### 安全

通过对一些操作重命名，防止误操作。SSL代理防止被监听。

## 源码

ziplist压缩列表

quicklist快速列表

quicklist是ziplist和linkedlist的混合体

skiplist跳跃表

字典遍历：

两种类型的遍历的迭代器，一种是安全迭代器，一种是不安全迭代器。

安全的迭代器在迭代时可以对字典查找和修改，不会导致数据重复，禁止rehashStep

不安全迭代器在迭代时是只读的，数据可能会重复，不影响rehash
