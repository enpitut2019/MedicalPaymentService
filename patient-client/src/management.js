import Web3 from "web3";
import CryptoJS from "crypto-js";
import {
    managementContractAddress,
    managementContractABI
} from "./contractData.js";

/** Management.solに対応, 暗号化, 復号などを提供 */
export default class {
    /** 初期化
     *  @param privateKey Ethereumの秘密鍵
     *  @param passPhrase 適当なパスワード
     */
    constructor(privateKey, passPhrase) {
        // nodeとの接続
        this.web3 = new Web3(
            "wss://rinkeby.infura.io/ws/v3/cf93a80dccb7456d806de40695023f72"
        );
        // 秘密鍵,パスワードの読み込み
        this.myAccount = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        this.passPhrase = passPhrase;
        // コントラクトの読み込み
        this.myContract = new this.web3.eth.Contract(
            managementContractABI,
            managementContractAddress
        );
    }

    /** イベントの購読設定 */
    subscribeEvent(callBackFunc) {
        this.callBackFunc = callBackFunc;
        this.subscription = this.myContract.events.StartExamination(
            { filter: { patientAddress: this.myAccount.address } },
            this.processEvent.bind(this)
        );
    }

    /** イベントの購読解除 */
    unload() {
        this.subscription.unsubscribe();
    }

    /** Eventを処理してからcallBackFuncに渡す */
    processEvent(error, event) {
        if (error) console.log(error);
        this.callBackFunc(event.event, event.returnValues);
    }

    /* 過去のイベントを読み込む */
    async getPastStartExaminationEvent() {
        await this.myContract.getPastEvents(
            "StartExamination",
            {
                filter: { patientAddress: this.myAccount.address },
                fromBlock: 0,
                toBlock: "latest"
            },
            (error, event) => {
                if (event.length) this.processEvent(error, event.pop());
            }
        );
    }

    /** メッセージに対して署名
     *  @param message メッセージ
     *  @return 署名
     */
    signMessage(message) {
        let re = this.myAccount.sign(message);
        return re.signature;
    }

    /** データを暗号化
     *  @param string 暗号化したい文字列
     *  @return 暗号文
     */
    encrypt(string) {
        let encryptedString = CryptoJS.AES.encrypt(
            string,
            this.passPhrase
        ).toString();
        return encryptedString;
    }

    /** データを復号（自分のパスフレーズで）
     *  @param encryptedString 暗号文
     *  @return 復号した文字列
     */
    decrypt(encryptedString) {
        return CryptoJS.AES.decrypt(encryptedString, this.passPhrase).toString(
            CryptoJS.enc.Utf8
        );
    }

    /** データを復号（引数のパスフレーズで）
     *  @param encryptedString 暗号文
     *  @param passPhrase パスフレーズ
     *  @return 復号した文字列
     */
    decrypt(encryptedString, passPhrase) {
        return CryptoJS.AES.decrypt(encryptedString, passPhrase).toString(
            CryptoJS.enc.Utf8
        );
    }

    /** 自分のEthereumアドレスを取得
     *  @return Ethereumアドレス
     */
    getAddress() {
        return this.myAccount.address;
    }
}
