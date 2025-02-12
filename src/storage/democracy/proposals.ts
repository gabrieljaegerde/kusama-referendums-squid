import { UnknownVersionError } from '../../common/errors'
import { DemocracyPublicPropsStorage } from '../../types/storage'
import { BatchContext, SubstrateBlock } from '@subsquid/substrate-processor'
import { Store } from '@subsquid/typeorm-store'

interface DemocracyProposalStorageData {
    index: number
    hash: Uint8Array
    proposer: Uint8Array
}

async function getStorageData(ctx: BatchContext<Store, unknown>, block: SubstrateBlock): Promise<DemocracyProposalStorageData[] | undefined> {
    const storage = new DemocracyPublicPropsStorage(ctx, block)
    if (storage.isV1020) {
        const storageData = await storage.getAsV1020()
        if (!storageData) return undefined

        return storageData.map((proposal): DemocracyProposalStorageData => {
            const [index, , proposer] = proposal
            return {
                index,
                hash: new Uint8Array(32).fill(0),
                proposer,
            }
        })
    } else if (storage.isV1022) {
        const storageData = await storage.getAsV1022()
        if (!storageData) return undefined

        return storageData.map((proposal): DemocracyProposalStorageData => {
            const [index, hash, proposer] = proposal
            return {
                index,
                hash,
                proposer,
            }
        })
    } else {
        throw new UnknownVersionError(storage.constructor.name)
    }
}

export async function getProposals(ctx: BatchContext<Store, unknown>, block: SubstrateBlock) {
    return await getStorageData(ctx, block)
}
