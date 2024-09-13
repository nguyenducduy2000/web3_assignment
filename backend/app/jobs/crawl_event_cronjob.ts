import Schedule from 'node-schedule'
import { ethers } from 'ethers'
import Transaction from '../../app/models/transaction.js'
import LastCrawledBlock from '../../app/models/last_crawled_block.js'
import contractAddress from '../../contracts/contract-address.json' assert { type: 'json' }
import StakingArtifact from '../../contracts/Staking.json' assert { type: 'json' }
import dotenv from 'dotenv'
// import config from '../config.js'

dotenv.config()

export default async function eventCrawler() {
    console.log('Crawling events...')
    const { Staking } = contractAddress
    const provider = new ethers.providers.JsonRpcProvider(process.env.BSC_URL)
    const stakingContract = new ethers.Contract(Staking, StakingArtifact.abi, provider)
    const chunkPerConjob = Number.parseInt(process.env.CHUNK_PER_CONJOB)
    const BLOCK_NUMBER = Number.parseInt(process.env.BLOCK_NUMBER)
    // Function to get the last crawled block
    async function getLastCrawledBlock() {
        const lastCrawled = await LastCrawledBlock.query().orderBy('id', 'desc').first()
        return lastCrawled ? lastCrawled.blockNumber : BLOCK_NUMBER // Start from config.BLOCK_NUMBER if no records exist
    }

    // Function to update the last crawled block
    async function updateLastCrawledBlock(blockNumber: number) {
        console.log(`Updating last crawled block to ${blockNumber}`)
        await LastCrawledBlock.updateOrCreate({}, { blockNumber })
    }

    async function crawlData(startBlock: number, endBlock: number) {
        console.log(`Crawling events from block ${startBlock} to ${endBlock}`)
        const events = await stakingContract.queryFilter({}, startBlock, endBlock)
        console.log(`Found ${events.length} events`)
        // console.log(events)

        for (const event of events) {
            const { transactionHash, blockNumber, logIndex, args } = event
            const user = args[0]
            const arg = args[1]
            // const amount = args.amount || ethers.BigNumber.from(0)
            // console.log(event)
            // Retrieve the transaction receipt to calculate the fee
            const receipt = await provider.getTransactionReceipt(transactionHash)
            const txnFee = receipt.gasUsed.mul(receipt.effectiveGasPrice)
            // const { gasPrice } = await provider.getTransaction(transactionHash) // gas price at the time of transaction
            const { timestamp } = await provider.getBlock(event.blockNumber)
            // console.log(timestamp)
            console.log('txnFee: ', txnFee)
            const alreadySaved = await Transaction.query()
                .where('transaction_hash', transactionHash)
                .andWhere('log_index', logIndex)
                .first()

            if (alreadySaved) {
                console.log(
                    `Skipping duplicate transaction: ${transactionHash} with logIndex: ${logIndex}`
                )
                continue
            }

            await Transaction.create({
                transactionHash,
                logIndex,
                method: event.event,
                block: blockNumber,
                age: timestamp,
                user: user,
                from: receipt.from,
                to: receipt.to,
                args: ethers.utils.formatEther(arg),
                // args: arg,
                // amount: ethers.utils.formatEther(amount),
                txnFee: ethers.utils.formatEther(txnFee),
            })

            console.log(`Saved transaction: ${transactionHash} with logIndex: ${logIndex}`)
        }
        await updateLastCrawledBlock(endBlock)
    }

    // Start the crawl job
    Schedule.scheduleJob('* * * * *', async () => {
        try {
            console.log('---------Starting cronjob---------')
            const currentBlock = await provider.getBlockNumber()
            let lastCrawledBlock = await getLastCrawledBlock()
            // Calculate the difference between the current block and the last crawled block
            let blockDiff = currentBlock - lastCrawledBlock
            console.log(`Last crawled block: ${lastCrawledBlock} Current block: ${currentBlock}`)
            console.log('Differences: ', blockDiff)

            if (blockDiff < chunkPerConjob) {
                await crawlData(lastCrawledBlock, currentBlock)
            } else if (blockDiff >= chunkPerConjob) {
                let endBlock = lastCrawledBlock + chunkPerConjob
                if (endBlock > currentBlock) {
                    endBlock = currentBlock
                }
                await crawlData(lastCrawledBlock, endBlock)
            } else {
                console.log('No new blocks to crawl')
            }
        } catch (error) {
            console.error('Error crawling events:', error)
        }
    })
}
