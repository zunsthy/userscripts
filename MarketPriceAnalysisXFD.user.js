// ==UserScript==
// @id          xinfadi-market-value-analysis-by-zunsthy
// @name        Market Value Analysis (xinfadi)
// @icon        http://www.xinfadi.com.cn/favicon.ico
// @category    utils
// @version     0.1.1
// @namespace   https://github.com/zunsthy/
// @updateURL   https://raw.githubusercontent.com/zunsthy/userscripts/master/MarketPriceAnalysisXFD.meta.js
// @downloadURL https://raw.githubusercontent.com/zunsthy/userscripts/master/MarketPriceAnalysisXFD.user.js
// @description fetch data and draw trending chart
// @author      ZunSThy <zunsthy@gmail.com>
// @include     http://www.xinfadi.com.cn/marketanalysis/0/list/*
// @match       http://www.xinfadi.com.cn/marketanalysis/0/list/*
// @grant       none
// ==/UserScript==

(() => {
  // config
  const checkDuplicate = true

  // const log = console.log.bind(console)
  const log = () => {}
  const error = console.error.bind(console)

  // local

  const local = {
    get partition() {
      const [stt, end] = (localStorage.getItem('partition') || '0,0').split(',').map(s => parseInt(s, 10))
      return { stt, end }
    },
    set partition({ stt, end }) {
      const str = [stt, end].join(',')
      localStorage.setItem('partition', str)
    },
  }

  // db

  let globalDB = window._db || null
  const dbName = 'market_analysis'
  const dbVersion = 2
  const storeName = 'market_value'

  const openDB = () => new Promise((resolve, reject) => {
    const end = (ev) => {
      globalDB = ev.currentTarget.result
      resolve(globalDB)
    }
    const initDB = (ev) => {
      const db = ev.currentTarget.result
      db.addEventListener('error', (ev) => { reject(ev.target.error) })
      const store = (db.objectStoreNames.contains(storeName)) ? ev.target.transaction.objectStore(storeName) : db.createObjectStore(storeName, { autoIncrement: true })
      const indexNames = store.indexNames
      const createIndex = (index) => {
        if (!indexNames.contains(index)) store.createIndex(index, index.split(',').map(s => s.trim()), { unique: false })
      }
      createIndex('name')
      createIndex('date')
      createIndex('date, name')
      createIndex('date, name, spec, unit')
    }
    const req = indexedDB.open(dbName, dbVersion)
    req.addEventListener('error', (ev) => { reject(ev.target.error) })
    req.addEventListener('success', (ev) => { end(ev) })
    req.addEventListener('upgradeneeded', (ev) => { initDB(ev) })
    setTimeout(() => { reject(new Error('open db timeout')) }, 1000)
  })

  if (!globalDB) openDB().then((db) => { window._db = db })

  const useTransaction = (mode = 'readonly') => {
    const tx = globalDB.transaction([storeName], mode)
    tx.addEventListener('error', (ev) => { error(ev.target.error) })
    tx.addEventListener('complete', () => { log('transaction complete') })
    const store = tx.objectStore(storeName)
    return store
  }

  const requestWrite = (entry) => {
    const store = useTransaction('readwrite')
    const req = store.add(entry)
    return req
  }

  const requestIndex = ({ indexName, query }) => {
    const store = useTransaction()
    const index = store.index(indexName)
    const req = index.get(query)
    return req
  }

  const requestIndexCursor = ({ indexName, query, direction }) => {
    const store = useTransaction()
    const index = store.index(indexName)
    const req = index.openCursor(query, direction)
    return req
  }

  const pWrite = (entry) => new Promise((resolve, reject) => {
    const req = requestWrite(entry)
    req.addEventListener('success', (ev) => { resolve(ev.target.result) })
    req.addEventListener('error', (ev) => { reject(ev.target.error) })
  })

  const pIndex = (params) => new Promise((resolve, reject) => {
    const req = requestIndex(params)
    req.addEventListener('success', (ev) => { resolve(ev.target.result) })
    req.addEventListener('error', (ev) => { reject(ev.target.error) })
  })

  const pIndexCursorIterate = (it, params) => new Promise((resolve, reject) => {
    const req = requestIndexCursor(params)
    let idx = 0
    req.addEventListener('success', (ev) => {
      const cursor = ev.target.result

      if (cursor) {
        const result = it(cursor.value, cursor.key, idx++)
        if (result !== undefined) resolve(result)
        else cursor.continue()
      } else {
        resolve()
      }
    })
    req.addEventListener('error', (ev) => { reject(ev.target.error) })
  })

  const pIndexCursor = (params) => new Promise((resolve, reject) => {
    const result = []
    const iterator = (value, key) => {
      result.push([value, key])
    }

    pIndexCursorIterate(iterator, params)
      .then(() => {
        resolve(result)
      }, reject)
  })

  const pIndexCursor0 = (params) => pIndexCursorIterate((v, k) => [v, k], params)

  // page

  const gu = n => `/marketanalysis/0/list/${n}.shtml`
  const getPageData = n => fetch(gu(n)).then((r) => {
    if (r.ok) return r.text()
    throw new Error(r.statusText + ' ' + gu(n))
  }).then((text) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'text/html')
    const table = doc.querySelector('.hq_table')
    return Array.prototype.slice.call(table.rows, 1).map(tr => Array.prototype.map.call(tr.cells, td => td.textContent))
  })
  const constructDataEntry = ([name, minValue, value, maxValue, spec, unit, date, others]) => ({
    name, minValue, value, maxValue, spec, unit, date, others
  })

  const size = document.querySelector('.hq_table').rows.length - 1
  const amount = Number(document.evaluate('//em[contains(text(),"共有")]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent.match(/\d+/)[0])
  const total = Number(document.querySelector('a[title="尾页"]').href.match(/(\d+)\.shtml/)[1])

  const batchGetPagesData = async function* ({ stt, end }) { for (let i = stt; i <= end; i++) yield getPageData(i) }
  const batchGetPagssDataEntry = async function* (range) { for await (let block of batchGetPagesData(range)) for (let entry of block) yield constructDataEntry(entry) }

  // data

  const saveRange = async (range) => {
    for await (let entry of batchGetPagssDataEntry(range)) {
      const key = [entry.date, entry.name, entry.spec, entry.unit]
      const exists = checkDuplicate && await pIndex({ indexName: 'date, name, spec, unit', query: key })
      if (!exists) {
        pWrite(entry).then(
          () => { log(`add entry ${entry.date}-${entry.name}`) },
          (err) => { error(`ERROR! add entry ${entry.date}-${entry.name} failed:`, err) }
        )
      } else {
        log('entry exists', key.join(','), entry)
      }
    }
    return range
  }

  const pageDateRangeResultCache = {}
  const pageDateRange = async (page) => {
    if (pageDateRangeResultCache[page]) return pageDateRangeResultCache[page]

    const range = { stt: page, end: page }
    const listDate = []
    for await (let entry of batchGetPagssDataEntry(range)) {
      listDate.push(parseDate(entry.date))
    }
    const result = { end: listDate[0], stt: listDate[listDate.length - 1] }
    pageDateRangeResultCache[page] = result
    return result
  }

  window.pageDateRange = pageDateRange

  // date

  const TIME_IN_DAY = 86400_000
  const pad2 = s => '00'.concat(s).slice(-2)
  const formatDate = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
  const parseDate = dstr => new Date(`${dstr}T00:00:00+08:00`)
  const compareDate = (d1, d2, op = '<') => {
    const t1 = d1.getTime()
    const t2 = d2.getTime()
    switch(op) {
      case '>': return t1 > t2
      case '>=': return t1 >= t2
      case '=':
      case '==':
      case '===': return t1 === t2
      case '<=': return t1 <= t2
      case '<': return t1 < t2
      default: return t1 < t2
    }
  }
  const isDuring = (d, dStt, dEnd) => (compareDate(d, dStt, '>=') && compareDate(d, dEnd, '<='))
  const transDateRangeToSeq = ({ stt, end }) => {
    const dstt = parseDate(stt)
    const dend = parseDate(end)
    const result = []
    for (const d = dstt; +d <= +dend; d.setTime(d.getTime() + TIME_IN_DAY)) result.push(formatDate(d))
    return result
  }

  // draw
  const compareValue = (a, b) => {
    switch (typeof a) {
      case 'number': return a - b
      case 'string': return a.localeCompare(b)
      default: return a.toString().localeCompare(b.toString())
    }
  }
  const min2 = (a, b) => (compareValue(a, b) < 0) ? a : b
  const max2 = (a, b) => (compareValue(a, b) > 0) ? a : b

  const leftpad = (s, n = 2, p = ' ') => p.repeat(n).concat(s.toString().slice(0, n)).slice(-n)

  const kT = (x, y) => `${x}|${y}`

  const scatterTableToString = (canvas, table) => {
    const { width, height } = canvas

    const rows = []
    for (let i = 0; i < height; i++) {
      let str = ''
      for (let j = 0; j < width; j++) {
        const list = table[kT(j, i)]
        if (!list) {
          str += ' '
          continue
        }
        // TODO: trans to 8 dots shape
        str += '·'
      }
      rows[i] = str;
    }
    return rows;
  }

  const drawScatterByX = (canvas, options) => {
    const { width, height } = canvas
    const { xAxis, yAxis, yLabel, xLabel, data } = options
    let yMin = yAxis.min !== undefined ? yAxis.min : +Infinity
    let yMax = yAxis.max !== undefined ? yAxis.max : -Infinity
    Object.entries(data).forEach(([x, y]) => {
      yMin = min2(y, yMin)
      yMax = max2(y, yMax)
    })

    const calcYCoord = (y) => {
      const yy = (y - yMin) / (yMax - yMin)
      const yb = height * yy
      const yc = Math.round(yb)
      return [yc, yb - yc]
    }
    const calcXCoord = (x) => {
      const xi = xAxis.data.indexOf(x)
      if (xi === -1) return [-1]
      const xx = xi / xAxis.data.length
      const xb = width * xx
      const xc = Math.round(xb)
      return [xc, xc - xb]
    }
    const calcCoord = (x, y) => {
      const [xc, dx] = calcXCoord(x)
      const [yc, dy] = calcYCoord(y)
      return { x, xc, dx, y, yc, dy }
    }

    const table = {}
    for (let i = 0; i < xAxis.data.length; i++) {
      const x = xAxis.data[i]
      const y = data[x]
      if (y === undefined) continue
      const c = calcCoord(x, y)
      const k = kT(c.xc, c.yc)
      if (!table[k]) table[k] = []
      table[k].push(c)
    }

    const chartRows = scatterTableToString(canvas, table)

    const leftLabelWidth = yLabel.width || 4
    const leftRows = [];
    for (let i = 0; i < height; i++) {
      let str = ' '.repeat(leftLabelWidth)
      if (i === 0) str = leftpad(yMax, leftLabelWidth)
      if (i === height - 1) str = leftpad(yMin, leftLabelWidth)
      leftRows.push(str)
    }

    const xLabel0 = xAxis.data[0]
    const xLabelN = xAxis.data[xAxis.data.length - 1]
    const bottomRow = ' '.repeat(leftLabelWidth + 1)
      + xLabel0
      + ' '.repeat(width - xLabel0.length - xLabelN.length)
      + xLabelN

    const yAxisStyle = yAxis.style || '│'
    const yAxisLineRows = []
    for(let i = 0; i < height; i++) yAxisLineRows.push(yAxisStyle)

    const zeroPoint = xAxis.zero || '└'
    const xAxisStyle = xAxis.style || '─'
    const xAxisLineRow = ' '.repeat(leftLabelWidth)
      + zeroPoint
      + xAxisStyle.repeat(width)

    const chart = chartRows.reverse()
      .map((line, i) => leftRows[i] + yAxisLineRows[i] + line)
      .concat(xAxisLineRow)
      .concat(bottomRow)

    console.log(chart.join('\n'))
  }

  // date - page

  const findDatePage = async (date) => {
    const isLeftBound = (range) => (
      (isDuring(date, range.stt, range.end))
      && (compareDate(range.stt, range.end, '<'))
      && (compareDate(date, range.end, '<'))
    )

    let sp = 1, ep = total

    const r1 = await pageDateRange(sp)
    if (isDuring(date, r1.stt, r1.end)) return sp
    const rn = await pageDateRange(ep)
    if (compareDate(date, rn.stt, '<')) return ep

    let safeCnt = Math.floor(Math.log2(total) * 3)
    while (sp < ep && safeCnt--) {
      if (sp === ep - 1) break

      const rLeft = await pageDateRange(sp)
      if (isLeftBound(rLeft)) return sp

      const rRight = await pageDateRange(ep)
      if (isLeftBound(rRight)) return ep

      const mp = Math.floor((sp + ep) / 2)
      const rMid = await pageDateRange(mp)
      if (isLeftBound(rMid)) return mp

      if (compareDate(rMid.end, rRight.end, '=')) ep = mp
      else if (isDuring(date, rMid.end, rLeft.stt)) ep = mp
      else if (isDuring(date, rRight.end, rMid.stt)) sp = mp
    }

    const rc = await pageDateRange(sp)
    if (isDuring(date, rc.stt, rc.end)) return sp
    return ep
  }

  window.findDatePage = findDatePage

  // app

  const findExistDate = async (minmax) => {
    const maxDate = '2025-01-01'
    const minDate = '2018-01-01'
    const key = IDBKeyRange.bound([minDate], [maxDate])
    const direction = minmax === 'min' ? 'next' : 'prev'
    const item0 = await pIndexCursor0({ indexName: 'date', query: key, direction })
    return item0[1]
  }

  window.findExistDate = findExistDate

  const updateData = async (type = 'new') => {
    let stt, end
    const safePage = 100
    if (type === 'old') {
      const datestr = await findExistDate('min')
      const date = parseDate(datestr)
      // date.setTime(date.getTime() - TIME_IN_DAY)
      stt = await findDatePage(date)
      end = Math.min(stt + safePage, total)
    } else {
      const datestr = await findExistDate('max')
      const date = parseDate(datestr)
      end = await findDatePage(date)
      stt = Math.max(end - safePage, 1)
    }
    return await saveRange({ stt, end })
  }

  window.updateData = updateData

  const manualFetchData = async ({ stt, end }) => {
    const dstt = parseDate(stt)
    dstt.setTime(dstt.getTime() - TIME_IN_DAY)
    const pstt = await findDatePage(dstt)
    const dend = parseDate(end)
    const pend = await findDatePage(dend)
    return await saveRange({ stt: pend, end: pstt })
  }

  window.manualFetchData = manualFetchData

  const allEntryByNameInDateRange = async (name, { stt, end }) => {
    const nameRange = IDBKeyRange.only([name])
    const dateRange = IDBKeyRange.bound(stt, end)
    const result = {}
    const iterator = ({ date, value }) => {
      if (!dateRange.includes(date)) return
      result[date] = +value
    }
    await pIndexCursorIterate(iterator, { indexName: 'name', query: nameRange, direction: 'next' })
    return result
  }

  const drawValueTrending = (name, { width, height, min, max, stt, end }) => {
    const canvas = {
      width: width || 80,
      height: height || 10,
    }
    const x = transDateRangeToSeq({ stt, end })

    allEntryByNameInDateRange(name, { stt, end })
    .then((data) => {
      drawScatterByX(canvas, {
        data,
        xAxis: { data: x, min: stt, max: end },
        yAxis: { min, max },
        xLabel: {},
        yLabel: { width: 4 }
      })
    })
  }

  window.drawValueTrending = drawValueTrending
})()
