// what do we want this thing to look like
//  it takes in a generator function and each time it encounters a yield
// exit execution and resume when it is time.
const https = require("https")

function taran(gen, ...rest) {
  const context = this

  return new Promise((resolve, reject) => {
    // we want to get the next iterator after we have fulfilled the promise
    // each gen call will return a new promise
    let genRef = gen
    if (typeof gen === "function") genRef = gen.apply(context, rest)
    if (!genRef || typeof genRef.next !== "function") return resolve(gen)

    onFulfilled()
    function onFulfilled(result) {
      let retVal
      try {
        // pass in the result of the previous value into the next iterator
        retVal = genRef.next(result)
      } catch (error) {
        reject(error)
      }
      next(retVal)
      return null
    }

    function next(ret) {
      // let's assume we passed in a promise
      const { done, value } = ret
      if (done) return resolve(value)
      const promisedValue = toPromise(value)
      if (isPromise(promisedValue)) {
        return ret.value.then(onFulfilled)
      }
    }
  })
}

function toPromise(val) {
  if (isPromise(val)) return val
  // hook this back into our runner and then the next will be called on this puppy
  if (isGen(val)) return taran.call(this, obj)
  if (typeof val === "function") return funcToPromise(val)
  return val
}

function funcToPromise(obj) {
  const context = this
  return new Promise((resolve, reject) => {
    obj.call(context, function cb(err, ...rest) {
      if (err) return reject(err)
      return resolve(...rest)
    })
  })
}

function isGen(val) {
  return typeof val.next === "function" && typeof val.throw === "function"
}

function isPromise(val) {
  return typeof val.then === "function"
}

taran(function* gen() {
  try {
    yield new Promise((resolve, reject) => resolve(console.log(1)))
    yield request("https://api.chucknorris.io/jokes/random").then(data => {
      const parsed = JSON.parse(data)
      console.log(parsed.value)
    })
    yield* someGen()
    yield request("https://api.chucknorris.io/jokes/random").then(data => {
      const parsed = JSON.parse(data)
      console.log(parsed.value)
    })
    return 3
  } catch (err) {
    console.log(err)
  }
})

function* someGen() {
  yield new Promise((resolve, reject) => resolve(console.log(2)))
}

const request = url => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`Status Code: ${res.statusCode}`))
      }

      const data = []

      res.on("data", chunk => {
        data.push(chunk)
      })

      res.on("end", () => resolve(Buffer.concat(data).toString()))
    })

    req.on("error", reject)

    // IMPORTANT
    req.end()
  })
}
