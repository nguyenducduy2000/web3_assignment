import eventCrawler from '../app/jobs/crawl_event_cronjob.js'
const isBuildCommand = process.argv.some((arg) => arg.includes('server'))
console.log(isBuildCommand)
if (isBuildCommand) {
    console.log('Backend is running...')
    eventCrawler()
}
