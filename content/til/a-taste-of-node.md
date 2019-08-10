---
title: A taste of Node
date: 2019-08-10
tag: Backend
---

Node is super useful for doing high throughput low latency I/O tasks! Here's a diagram
that roughly describes how Node works (I omitted libuv but you can bet it's there):

<pre>
Server/A machine                                               World/Another machine  
+-----------------------------------------------+              +-------------+
| +-------------+                               |              |             |
| |JS           |                               |              |             |
| |             |                               +--------------&gt;             |
| |             |                               |              |             |
| |             |                               |              |             |
| |             |                               |              +-----+-------+
| +---+--^------+                               |                    |
|     |  |                                      |                    |
|     |  |                                      |                    |
|     |  |                                      |                    |
|     |  |                                      |                    |
|     |  |                                      |                    |
|  +--v--+------------+  +------------------+   |                    |
|  |Node (C++)        |  |OSS               |   |                    |
|  |                  |  |                  |   |                    |
|  |                  &lt;--+                  |   |                    |
|  |                  +--&gt;                  |   |                    |
|  |                  |  |                  |   |&lt;-------------------+
|  |                  |  |                  |   |
|  +------------------+  +------------------+   |
|                                               |
+-----------------------------------------------+
</pre>
