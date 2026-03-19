import fs from "node:fs"
import path from "node:path"
import * as R from "ramda"
import { config } from "../config.js"

const dayStr = (ts) => new Date(ts).toISOString().slice(0, 10).replace(/-/g, "")
const MAX_FILE_SIZE_BYTES = Math.floor(config.storage.max_file_size_mb * 1024 * 1024 / 20)

export const makeNdjsonWriter = ({ dataDir, filePrefix }) => {
  let prevDay
  let seq

  const fileFor = async (ts) => {
    const day = dayStr(ts)
    if (day !== prevDay) {
      prevDay = day
      seq = 0
    }

    while (
      await fs.promises.stat(path.join(dataDir, `${filePrefix}_${day}_${seq}.ndjson`))
        .then((stats) => stats.size > MAX_FILE_SIZE_BYTES)
        .catch(() => false)
    ) {
      seq++
    }
    
    return path.join(dataDir, `${filePrefix}_${day}_${seq}.ndjson`)
  }

  const appendRows = async (rows = []) => {
    if (R.isEmpty(rows)) return

    const ts = Number.isFinite(rows[0]?.ts) ? rows[0].ts : Date.now()
    const file = await fileFor(ts)
    await fs.promises.mkdir(path.dirname(file), { recursive: true })
    const lines = rows.map((r) => JSON.stringify(r)).join("\n").concat("\n")
    await fs.promises.appendFile(file, lines, "utf8")
  }

  const close = async () => {}

  return { appendRows, close }
}
