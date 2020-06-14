import express from 'express'
import bodyParser from 'body-parser'
// import db from '../api/db.js' <====== 這個
import db from './db.js'

const app = express()

app.use(bodyParser.json())
// 新增
app.post('/new', async (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    res.status(400)
    res.send({ success: false, message: '請回傳 json 格式' })
    return
  }

  if (req.body.name === undefined ||
    req.body.price === undefined ||
    req.body.description === undefined ||
    req.body.count === undefined
  ) {
    res.status(400)
    res.send({ sucess: false, message: '欄位不正確' })
    return
  }

  try {
    const result = await db.user.create(
      {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        count: req.body.count
      }
    )
    res.status(200)
    res.send({ success: true, message: '', id: result._id })
  } catch (error) {
    const message = error.errors[Object.keys(error.errors)[0]].message
    res.status(400)
    res.send({ success: false, message })
  }
})
// 修改
app.patch('/update/:type', async (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    res.status(400)
    res.send({ sucess: false, message: '請回傳 json 格式' })
    return
  }

  if (
    req.params.type !== 'name' &&
    req.params.type !== 'price' &&
    req.params.type !== 'description' &&
    req.params.type !== 'count'
  ) {
    res.status(400)
    res.send({ sucess: false, message: '更新欄位不符' })
    return
  }

  try {
    const type = req.params.type
    await db.findByIdAndUpdate(req.body.id, {
      [type]: req.body.data
    }, { new: true })
    res.send({ success: true, message: '' })
  } catch (error) {
    console.log(error.msg)
    res.status(500)
    res.send({ success: false, message: '發生錯誤' })
  }
})
// 刪除
app.delete('/delete', async (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    res.status(400)
    res.send({ sucess: false, message: '請回傳 json 格式' })
    return
  }

  try {
    const result = await db.findOneAndDelete(req.body.id)
    if (result === null) {
      res.status(404)
      res.send({ success: false, message: '找不到資料' })
    } else {
      res.send({ success: true, message: '' })
    }
  } catch (error) {
    res.status(200)
    res.status(500)
    res.send({ success: false, message: '發生錯誤' })
  }
})
// 查詢商品
app.get('/product', async (req, res) => {
  // query是去抓網址的get參數
  if (req.query.id === undefined) {
    res.status(400)
    res.send({ success: false, message: '欄位不正確' })
    return
  }

  try {
    const result = await db.findById(req.query.id)
    res.send({
      success: true,
      message: '',
      name: result.name,
      price: result.price,
      description: result.description,
      count: result.count
    })
  } catch (error) {
    res.status(404)
    res.send({ success: false, message: '找不到' })
  }
})
// 查詢所有商品
app.get('/all', async (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    res.status(400)
    res.send({ sucess: false, message: '請回傳 json 格式' })
    return
  }
  try {
    const result = await db.find().select({ _id: 0, __v: 0 })
    console.log(result)
    res.send({ sucess: true, message: '', products: result })
  } catch (error) {
    console.log(error)
    res.status(404)
    res.send({ success: false, message: '目前無任何資料' })
  }
})
// 查詢庫存商品
app.get('/instock', async (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    res.status(400)
    res.send({ sucess: false, message: '請回傳 json 格式' })
    return
  }
  try {
    // (>=) 大于等于 - $gte  _id: 0, __v: 0 0 = false  1 = true
    const result = await db.find({ count: { $gte: 10 } }).select({ _id: 0, __v: 0 })
    res.send({ sucess: true, message: '', products: result })
  } catch (error) {
    res.status(404)
    res.send({ success: false, message: '目前無任何資料' })
  }
})

app.listen(3000, () => {
  console.log('網頁伺服器已啟動')
  console.log('http://localhost:3000')
})
