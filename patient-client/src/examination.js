import CryptoJS from "crypto-js";
import { examinationContractABI, erc20tokenABI } from "./contractData.js";

/** Examination.solに対応したクラス */
export default class {
    /** 初期化
     *  @param management management.jsのクラス
     *  @param examinationContractAddress Examinationコントラクトのアドレス
     */
    constructor(management, examinationContractAddress, erc20tokenAddress) {
        this.management = management;
        this.myAccount = this.management.myAccount;
        this.web3 = this.management.web3;
        this.myContract = new this.web3.eth.Contract(
            examinationContractABI,
            examinationContractAddress
        );
        this.erc20Token = new this.web3.eth.Contract(
            erc20tokenABI,
            erc20tokenAddress
        );
    }

    /** イベントの購読設定
     *  @param callBackFunc イベントが発生した時に呼ばれる関数(引数はeventとvalue)
     */
    subscribeEvent(callBackFunc) {
        this.callBackFunc = callBackFunc;
        // Examinationのイベント
        this.subscription1 = this.myContract.events.allEvents(
            {},
            this.processEvent.bind(this)
        );
        // ERC20トークンのイベント
        // ExaminationContract宛てのTransfer
        this.subscription2 = this.erc20Token.events.Transfer(
            { filter: { to: this.myContract.options.address } },
            this.processEvent.bind(this)
        );
    }

    /** Eventを処理してからcallBackFuncに渡す */
    processEvent(error, event) {
        if (error) console.log(error);
        this.callBackFunc(event.event, event.returnValues);
    }

    /** イベントの購読解除 */
    unload() {
        this.subscription1.unsubscribe();
        this.subscription2.unsubscribe();
    }

    /** 患者の情報を取得
     *  @returns patientAddress 患者のアドレス
     *  @returns patientData 復号された患者の情報
     */
    async getPatientInfo() {
        let patientInfo = await this.myContract.methods.getPatientInfo().call();
        let patientAddress = patientInfo[0];
        let patientData;
        patientData = this.management.decrypt(
            patientInfo[1],
            this.management.passPhrase
        );
        return { address: patientAddress, data: patientData };
    }

    /** 医療費の支払いに使うERC20トークンの情報を取得
     *  @returns name トークンの名称
     *  @returns symbol トークンの単位
     *  @returns decimals 小数点以下の桁数
     */
    async getTokenData() {
        return await this.myContract.methods.getTokenData().call();
    }

    /** コントラクトで使用したEther量を取得
     *  @returns Ether量
     */
    async getUsedEther() {
        let usedEther = await this.myContract.methods.getUsedEther().call();
        return this.web3.utils.fromWei(usedEther);
    }

    /** コントラクトの支払い状況の取得
     * @return uint256 デポジット金額
     * @return uint256 登録された医療費
     * @return uint256 未収金金額
     * @return bool 医療費が確定しているか
     */
    async getPaymentStatus() {
        let paymentStatus = await this.myContract.methods
            .getPaymentStatus()
            .call();
        return paymentStatus;
    }
}
