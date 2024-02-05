const sharp = require("sharp");
const fs = require("fs");

let lastMemoryUsage = process.memoryUsage()

const formatBytes = (bytes) => {
    const units = ['B', 'kB', 'MB', 'GB', 'TB']
    const sign = bytes < 0 ? '-' : ''
    bytes = Math.abs(bytes)
    let unitIndex = 0

    while (bytes >= 1024 && unitIndex < units.length - 1) {
        bytes /= 1024
        unitIndex++
    }

    return `${sign}${bytes.toFixed(2)} ${units[unitIndex]}`
}

const dumpMemoryUsage = (label, lastMemoryUsage) => {
    const nowMemoryUsage = process.memoryUsage()
    console.log(`[${label}]`)
    console.log(`rss=${formatBytes(nowMemoryUsage.rss - lastMemoryUsage.rss)}`)
    console.log(
        `arrayBuffers=${formatBytes(nowMemoryUsage.arrayBuffers - lastMemoryUsage.arrayBuffers)}`,
    )
    console.log(
        `external=${formatBytes(nowMemoryUsage.external - lastMemoryUsage.external)}`,
    )
    console.log(
        `heapUsed=${formatBytes(nowMemoryUsage.heapUsed - lastMemoryUsage.heapUsed)}`,
    )
    console.log(
        `heapTotal=${formatBytes(nowMemoryUsage.heapTotal - lastMemoryUsage.heapTotal)}`,
    )
    console.log('')
    return nowMemoryUsage
}


const main = async () => {
    lastMemoryUsage = dumpMemoryUsage("Before reading image", lastMemoryUsage)
    const sharpOptions = {
            limitInputPixels: 10_000_000,
            sequentialRead: true,
        },
        // imagePath = './images/b310f15738ff8906ee541b40a2a8d083c4d9ba40.svg',  // 340KB
        imagePath = './images/382e681f45f125becf16cca876b05c880f7be75a.svg',  // 2.5MB
        imageBuffer = fs.readFileSync(imagePath);

    const resImageBuffer = await sharp(imageBuffer, sharpOptions)
        .resize({
            width: 256,
            height: 256,
            fit: 'contain',
            background: 'white',
            kernel: 'lanczos3',
        })
        .flatten({background: 'white'})
        .jpeg({quality: 75, mozjpeg: true})
        .toBuffer()

    lastMemoryUsage = dumpMemoryUsage("After reading image", lastMemoryUsage)

    return resImageBuffer
}

main()
    .catch(console.error)
    .finally(() => dumpMemoryUsage("End", lastMemoryUsage))
