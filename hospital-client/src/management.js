import Web3 from 'web3';
import CryptoJS from 'crypto-js';
import { managementContractAddress, managementContractABI } from './contractData.js';

export default class {
    constructor(privateKey, passPhrase, isHospital) {
        // nodeとの接続
        this.web3 = new Web3('wss://rinkeby.infura.io/ws/v3/cf93a80dccb7456d806de40695023f72');
        // 秘密鍵の読み込み
        this.myAccount = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        this.isHospital = isHospital;
        // 暗号鍵の保存
        this.passPhrase = passPhrase;
        // コントラクトの読み込み
        this.myContract = new this.web3.eth.Contract(managementContractABI, managementContractAddress);
    }

    /** イベントの購読設定 */
    subscribeEvent(callBackFunc) {
        this.callBackFunc = callBackFunc;
        this.subscription = this.myContract.events.allEvents({}, this.processEvent.bind(this));
    }

    /** スマートコントラクトのデプロイ
     *  @param _patientData 患者データを暗号化した物
     *  @param _signature _patientDataに対する患者の署名
     *  @param _patientPassPhrase 患者の暗号鍵
     *  @returns デプロイしたコントラクトのアドレス
    */
    async deploy(_patientData, _signature, _patientPassPhrase) {
        if (!this.isHospital) return;
        let patientPassPhrase = CryptoJS.AES.encrypt(_patientPassPhrase, this.passPhrase).toString();
        let encodedABI = this.myContract.methods.startExamination(_patientData, _signature, patientPassPhrase).encodeABI();
        let gasAmount = await this.myContract.methods.startExamination(_patientData, _signature, patientPassPhrase).estimateGas({ from: this.myAccount.address }) + 10000;
        let signedTx = await this.myAccount.signTransaction({ to: this.myContract.options.address, data: encodedABI, gas: gasAmount });
        let receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }

    /** Event発生時のコールバック関数 */
    processEvent(error, event) {
        if (error) console.log(error);
        this.callBackFunc(event.event, event.returnValues);
    }

    /** メッセージに対して署名 */
    signMessage(message) {
        let re = this.myAccount.sign(message);
        return re.signature;
    }

    /** データを暗号化 */
    encrypt(string) {
        let encryptedString = CryptoJS.AES.encrypt(string, this.passPhrase).toString();
        return encryptedString;
    }

    /** データを復号 */
    decrypt(encryptedString, key) {
        return CryptoJS.AES.decrypt(encryptedString, key).toString(CryptoJS.enc.Utf8);
    }

    getAddress() {
        return this.myAccount.address;
    }
}