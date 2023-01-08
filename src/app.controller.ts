import { Controller, Get, Param, Post, Query, Body } from '@nestjs/common';
import {
  AppService,
  ClaimPaymentDTO,
  PaymentOrder,
  ToDelegate,
  ToSubmitVote,
} from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('token-address')
  getTokenAddress() {
    return this.appService.getTokenAddress();
  }

  @Get('total-supply')
  getTotalSupply() {
    return this.appService.getTotalSupply();
  }

  @Get('mint-tokens')
  mintToken() {
    return this.appService.mintToken();
  }

  @Get('allowance')
  getAllowance(@Query('from') from: string, @Query('to') to: string) {
    return this.appService.getAllowance(from, to);
  }

  @Get('transaction-by-hash/:hash')
  getTransactionByHash(@Param('hash') hash: string) {
    return this.appService.getTransactionByHash(hash);
  }

  @Get('transaction-receipt-by-hash/:hash')
  getTransactionReceiptByHash(@Param('hash') hash: string) {
    return this.appService.getTransactionReceiptByHash(hash);
  }

  @Get('list-payment-orders')
  listPaymentOrders() {
    return this.appService.listPaymentOrders();
  }

  @Get('get-payment-order')
  getPaymentOrder(@Query('id') id: string) {
    return this.appService.getPaymentOrderById(id);
  }

  @Get('get-winning-proposal')
  getWinningProposal() {
    return this.appService.getWinningProposal();
  }

  @Post('create-order')
  createOrder(@Body() body: PaymentOrder) {
    this.appService.createPaymentOrder(body);
  }

  @Post('claim-payment')
  claimPayment(@Body() body: ClaimPaymentDTO) {
    return this.appService.claimPayment(body);
  }

  @Post('request-voting-tokens')
  requestTokens(@Body() body: any) {
    return this.appService.requestTokens(body);
  }

  @Post('delegate-vote')
  delegateVote(@Body() body: ToDelegate) {
    return this.appService.delegateVote(body);
  }

  @Post('submit-vote')
  submitVote(@Body() body: ToSubmitVote) {
    return this.appService.submitVote(body);
  }
}
