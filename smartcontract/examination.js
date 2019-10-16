let Web3 = require('web3');
let CryptoJS = require('crypto-js');

module.exports = class examination {
    /** 初期化 
     *  @param privateKey 秘密鍵
     *  @param passPhrase AES256の暗号鍵
     *  @param isHospital 病院として使うならTrue
    */
    constructor(privateKey, passPhrase, isHospital) {
        // nodeとの接続
        this.web3 = new Web3('wss://rinkeby.infura.io/ws/v3/cf93a80dccb7456d806de40695023f72');
        // 秘密鍵の読み込み
        this.myAccount = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        this.isHospital = isHospital;
        // 暗号鍵の保存
        this.passPhrase = passPhrase;
    }

    /** コントラクトの読み込みm
     *  @param contractAddress デプロイされたコントラクトのアドレス
    */
    async init(contractAddress) {
        // コントラクトの読み込み
        let contractABI = [{ "constant": false, "inputs": [], "name": "withDraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "_medicalCost", "type": "uint256" }], "name": "setMedicalCost", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getPatientInfo", "outputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "string", "name": "", "type": "string" }, { "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "bytes", "name": "_signature", "type": "bytes" }], "name": "signMedicalCost", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getUsedEther", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getPaymentStatus", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getTokenData", "outputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint8", "name": "decimals", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_patientData", "type": "string" }, { "internalType": "bytes", "name": "_signature", "type": "bytes" }, { "internalType": "string", "name": "_patientPassPhrase", "type": "string" }, { "internalType": "address", "name": "_hospitalAddress", "type": "address" }, { "internalType": "address", "name": "_tokenAddress", "type": "address" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "payable": false, "stateMutability": "nonpayable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "medicalCost", "type": "uint256" }], "name": "SetMedicalCost", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "bool", "name": "signed", "type": "bool" }], "name": "SignMedicalCost", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "unpaidCost", "type": "uint256" }], "name": "WithDraw", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Refund", "type": "event" }];
        this.myContract = new this.web3.eth.Contract(contractABI, contractAddress);
        // ERC20トークンの情報を取得
        this.tokenData = await this.myContract.methods.getTokenData().call();
        // イベントの取得設定
        this.myContract.events.allEvents({}, this.processEvent.bind(this));
    }

    /** 患者の情報を取得 
     *  @returns patientAddress 患者のアドレス
     *  @returns patientData 復号された患者の情報
    */
    async getPatientInfo() {
        let patientInfo = await this.myContract.methods.getPatientInfo().call();
        let patientAddress = patientInfo[0];
        let patientData;
        if (this.isHospital) {
            let patientPassPhrase = CryptoJS.AES.decrypt(patientInfo[2], this.passPhrase).toString(CryptoJS.enc.Utf8);
            patientData = CryptoJS.AES.decrypt(patientInfo[1], patientPassPhrase).toString(CryptoJS.enc.Utf8);
        } else {
            patientData = CryptoJS.AES.decrypt(patientInfo[1], this.passPhrase).toString(CryptoJS.enc.Utf8);
        }
        return { address: patientAddress, data: patientData };
    }

    /** 医療費の支払いに使うERC20トークンの情報を取得
     *  @returns name トークンの名称
     *  @returns symbol トークンの単位
     *  @returns decimals 小数点以下の桁数
     */
    getTokenData() {
        return this.tokenData;
    }

    /** コントラクトで使用したEther量を取得 
     *  @returns Ether量
    */
    async getUsedEther() {
        let usedEther = await this.myContract.methods.getUsedEther().call();
        return this.web3.utils.fromWei(usedEther);
    }

    /** コントラクトの支払い状況の取得 */
    async getPaymentStatus() {
        let paymentStatus = await this.myContract.methods.getPaymentStatus().call();
        console.log(paymentStatus);
    }

    /** 医療費の登録 
     *  @param medicalCost 医療費
     */
    async setMedicalCost(medicalCost) {
        // 整数部と小数部を分解して適当に処理する
        let medicalCostStr = String(medicalCost) + ".00";
        let num = medicalCostStr.split('.')
        medicalCostStr = num[0] + num[1];
        let tokenAmount = this.web3.utils.toBN(Number(medicalCostStr));
        let inputDecimalLen = num[1].length;
        let decimals = this.web3.utils.toBN(this.tokenData["decimals"]);
        let tokenAmountHex = "0x" + tokenAmount.mul(this.web3.utils.toBN(10).pow(decimals)).toString('hex');
        // トランザクションを発行
        let encodedABI = this.myContract.methods.setMedicalCost(tokenAmountHex).encodeABI();
        let gasAmount = await this.myContract.methods.setMedicalCost(tokenAmountHex).estimateGas({ from: this.myAccount.address }) + 10000;
        let signedTx = await this.myAccount.signTransaction({ to: this.myContract.options.address, data: encodedABI, gas: gasAmount });
        let receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(receipt);
        return receipt;
    }

    /** 医療費の確定
     *  @param signature 医療費に対する患者の署名
     */
    async signMedicalCost(signature) {
        let sigAddress = await web3.eth.accounts.recover(String(medicalCost), signature);
        // TODO:sigAddressとpatientAddrssが違う時はエラーを出す
        console.log("sigAddrss : " + sigAddrses);
        let encodedABI = this.myContract.methods.signMedicalCost(signature).encodeABI();
        let gasAmount = await this.myContract.methods.signMedicalCost(signature).estimateGas({ from: this.myAccount.address }) + 10000;
        let signedTx = await this.myAccount.signTransaction({ to: examinationContractAddress, data: encodedABI, gas: gasAmount });
        let receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(receipt);
    }

    /** 医療費の引き出し(病院のみ実行可) */
    async withDraw() {
        let encodedABI = this.myContract.methods.withDraw().encodeABI();
        let gasAmount = await this.myContract.methods.withDraw().estimateGas({ from: this.myAccount.address }) + 10000;
        let signedTx = await this.myAccount.signTransaction({ to: examinationContractAddress, data: encodedABI, gas: gasAmount });
        let receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(receipt);
    }

    /** 医療費の返金(病院のみ実行可) */
    async refund() {
        const encodedABI = this.myContract.methods.refund().encodeABI();
        let gasAmount = await this.myContract.methods.refund().estimateGas({ from: this.myAccount.address }) + 10000;
        let signedTx = await this.account.signTransaction({ to: examinationContractAddress, data: encodedABI, gas: gasAmount });
        let receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(receipt);
    }

    /** Event発生時のコールバック関数 */
    processEvent(error, event) {
        console.log(event);
    }

    /** メッセージに対して署名 */
    signMessage(message) {
        let re = this.myAccount.sign(message);
        return re.signature;
    }

    /** データを暗号化 */
    encryptData(data) {
        let encryptedData = CryptoJS.AES.encrypt(data, this.passPhrase).toString();
        return encryptedData;
    }

    getPassPhrase() {
        return this.passPhrase;
    }

    getAddress() {
        return this.myAccount.address;
    }

    signMedicalCost(medicalCost) {

    }
}