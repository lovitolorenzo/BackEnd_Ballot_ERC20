import { HttpException, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import * as TokenJson from './assets/MyToken.json';
import * as TokenizedBallotJson from './assets/TokenizedBallot.json';
//To import ABI from Contract's Json we need to set first ""resolveJsonModule": true" in tsconfig.json/"compilerOptions"
dotenv.config();

const MYTOKEN_CONTRACT_ADDRESS = '0xf1E56D0Ffc2E6425213b701a467918923A4f8c13'; //Lesson 12's Contract
const TOKENIZED_BALLOT_CONTRACT_ADDRESS =
  '0x110557Da3cE276AD14915aD72a993Aa8c548C7E5'; //Lesson 12's Contract

// require("@nomiclabs/hardhat-ethers");

export class ClaimPaymentDTO {
  id: string;
  secret: string;
  address: string;
}

export class PaymentOrder {
  id: string;
  secret: string;
  amount: number;
}

export class ToDelegate {
  address: string;
}

export class ToSubmitVote {
  choice: string;
}

@Injectable()
export class AppService {
  provider: ethers.providers.BaseProvider;
  contract: ethers.Contract;
  tokenized_ballot_contract: ethers.Contract;
  database: PaymentOrder[];
  seed: string;
  wallet: ethers.Wallet;
  signer: ethers.Wallet;

  constructor() {
    this.provider = ethers.getDefaultProvider('goerli');
    //Fetching an old contract without redeploying it
    this.contract = new ethers.Contract(
      MYTOKEN_CONTRACT_ADDRESS,
      TokenJson.abi, //ABI's contract fetched by the Json of the Contract
      this.provider,
    );

    this.tokenized_ballot_contract = new ethers.Contract(
      TOKENIZED_BALLOT_CONTRACT_ADDRESS,
      TokenizedBallotJson.abi, //ABI's contract fetched by the Json of the Contract
      this.provider,
    );

    //process.env.MNEMONIC
    this.seed = process.env.MNEMONIC; //To fetch the seed from .env we need
    // to set in app.module.ts  under @Module imports: [ConfigModule.forRoot()],
    this.wallet = ethers.Wallet.fromMnemonic(this.seed ? this.seed : '');
    this.signer = this.wallet.connect(this.provider);
    this.database = [];
  }

  async mintToken() {
    const tokensAmount = '5';
    console.log({ receiverOfMinted: this.signer.address });
    const signedContract = this.contract.connect(this.signer);
    const tx = await signedContract.mint(
      this.signer.address,
      ethers.utils.parseEther(tokensAmount.toString()),
    );
    return { result: tx };
  }

  async getTotalSupply() {
    const totalSupplyBN = await this.contract.totalSupply();
    const totalSupply = ethers.utils.formatEther(totalSupplyBN);
    return { result: totalSupply };
  }

  async delegateVote(body: ToDelegate) {
    const { address } = body;
    console.log(address);
    const delegateTx1 = await this.contract
      .connect(this.signer)
      .delegate(address);
    console.log({ delegateTx1 });
    return { result: delegateTx1 };
  }

  async submitVote(body: ToSubmitVote) {
    const { choice } = body;
    const voteTx = await this.tokenized_ballot_contract
      .connect(this.signer)
      .vote(choice, ethers.utils.parseEther('1'));

    return { result: voteTx };
  }

  async getWinningProposal() {
    const winningProposal = await this.tokenized_ballot_contract
      .connect(this.signer)
      .winningProposal();

    const { name } = winningProposal;
    const { voteCount } = winningProposal;

    const deciphredWinningProposal = {
      name: ethers.utils.parseBytes32String(name),
      voteCount: ethers.utils.formatEther(voteCount),
    };
    return { result: deciphredWinningProposal };
  }

  async getAllowance(from: string, to: string) {
    const allowanceBN = await this.contract.allowance(from, to);
    const allowance = ethers.utils.formatEther(allowanceBN);
    return { result: allowance };
  }

  getTransactionByHash(hash: string) {
    return { result: this.provider.getTransaction(hash) };
  }

  async getTransactionReceiptByHash(hash: string) {
    const tx = this.getTransactionByHash(hash);
    return { result: tx };
  }

  createPaymentOrder(body: PaymentOrder) {
    this.database.push(body);
  }

  getPaymentOrderById(id: string) {
    const element = this.database.find((entry) => entry.id === id);
    if (!element) throw new HttpException('Not found', 404);
    return { id: element.id, amount: element.amount };
  }

  listPaymentOrders() {
    const listPaymentOrders = [];
    for (const e in this.database) {
      listPaymentOrders.push({
        id: this.database[e].id,
        amount: this.database[e].amount,
      });
    }
    return { result: listPaymentOrders };
  }

  async claimPayment(body: ClaimPaymentDTO) {
    const element = this.database.find((entry) => entry.id === body.id);
    if (!element) throw new HttpException('Not Found', 404);
    if (body.secret != element.secret) return false;

    //To fetch the seed from .env we need
    // to set in app.module.ts  under @Module imports: [ConfigModule.forRoot()],

    const wallet = ethers.Wallet.fromMnemonic(this.seed);

    const signedContract = this.contract.connect(this.signer);
    const tx = await signedContract.mint(
      body.address,
      ethers.utils.parseEther(element.amount.toString()),
    );
    return { result: tx };
  }

  getTokenAddress() {
    return { result: MYTOKEN_CONTRACT_ADDRESS };
  }

  requestTokens(body: any) {
    return { result: body };
  }
}
