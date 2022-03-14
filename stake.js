// import {
//     Program,
//     Provider,
//     web3,
// } from '@project-serum/anchor'
import anchor from '@project-serum/anchor'
import {
    Connection,
    clusterApiUrl,
    PublicKey,
} from '@solana/web3.js'

import staking from './nft_staking.json'
import WALLET from './wallet.json';
const { SystemProgram, SYSVAR_RENT_PUBKEY, SYSVAR_CLOCK_PUBKEY } = anchor.web3
const programID = new PublicKey("GBpQdoXPzopEfP6Nmwv6PprWUo1nKcziK6Bqjeb7pCzi")
const candyV2 = new PublicKey("9sE3fwvzZzafGGtjKo9CT5pYjQzu3E8xKtjntHPyJBJx")
const rewardToken = new PublicKey("GzZD166nLtGoA3QmLphRYQjQuhMMkndciGtm3hQc2tBV")
const seeds = {
    user: anchor.utils.bytes.utf8.encode("user_deposit"),
    staking: "staking_instance",
    metadata: anchor.utils.bytes.utf8.encode("sidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"),
    token: anchor.utils.bytes.utf8.encode("sidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"),
}
const opts = {
    preflightCommitment: "recent",
  };

async function main() {
    const network = clusterApiUrl("devnet")
    const connection = new Connection(network, opts.preflightCommitment);
    const wallet = anchor.web3.Keypair.fromSecretKey(Uint8Array.from(WALLET))
    const walletK = new anchor.Wallet(wallet)
    const provider = new anchor.Provider(
        connection, walletK, opts.preflightCommitment,
    )
    const program = new anchor.Program(staking, programID, provider);
    const [programPDA, programBump] = 
        await PublicKey.findProgramAddress([Buffer.from(seeds.staking, "utf8"), wallet.publicKey.toBuffer()], programID);
    console.log(programPDA.toString());
    const [userPDA, userBump] = await PublicKey.findProgramAddress([Buffer.from(seeds.user)], wallet.publicKey);
    // const metadataBump = await PublicKey.findProgramAddress([Buffer.from('', 'utf8')], programID);

    await program.rpc.initializeStaking(new anchor.BN(150), programBump, {
        accounts: {
            authority: wallet.publicKey,
            rewardTokenMint: rewardToken,
            allowedCollectionAddress: candyV2,
            stakingInstance: programPDA,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
            time: SYSVAR_CLOCK_PUBKEY
        },
        signers: [wallet],
    })

    await program.rpc.initializeUser(programBump, userBump, {
        accounts: {
            authority: wallet.publicKey,
            userInstance: userPDA,
            stakingInstance: programPDA,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
            time: SYSVAR_CLOCK_PUBKEY
        },
        signers: [wallet],
    })

    // await program.rpc.enter_staking(new BN(1), new BN(1), {
    //     accounts: {
    //         myAccount: localAccount.publicKey,
    //         user: provider.wallet.publicKey,
    //         systemProgram: SystemProgram.programId,
    //     },
    //     signers: [wallet],
    // })

    // const acc = await program.account.myAccount.fetch(localAccount.publicKey)

}

main().then("finish")

// node --experimental-json-modules stake.js 