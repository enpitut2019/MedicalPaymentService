pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

/** @dev 診療ごとに発行されるコントラクト
  */
contract Examination{
    address private hospitalAddress;
    address private patientAddress;
    uint256 private medicalCost;
    uint256 private unpaidCost;
    bool private signCompleted;
    string private patientData;
    string private patientPassPhrase;
    uint256 private usedEther;
    MedicalNote[] public medicalNotes;
    ERC20Detailed internal ERC20Token;

    struct MedicalNote {
        string note;
        uint256 timestamp;
    }
    
    event SetMedicalCost(uint256 medicalCost);
    event SignMedicalCost(bool signed);
    event WithDraw(uint256 unpaidCost);
    event AddMedicalNote(uint256 timestamp, string note);
    event EventFailed(string eventName, string message);
    
    /** @dev 患者から署名付きの患者データを受け取ってスマートコントラクトを初期化
      * @param _patientData 患者データを暗号化した物
      * @param _signature _patientDataに対する患者の署名
      * @param _patientPassPhrase 患者の暗号鍵をさらに病院の暗号鍵で暗号化したもの
      * @param _hospitalAddress 病院のアドレス
      * @param _tokenAddress 使用するERC20準拠Tokenのコントラクトアドレス
      */
    constructor(string memory _patientData, bytes memory _signature, string memory _patientPassPhrase, address _hospitalAddress, address _tokenAddress) public countUsedETH{
        patientData = _patientData;
        patientAddress = recoverAddress(_patientData, _signature);
        patientPassPhrase = _patientPassPhrase;
        hospitalAddress = _hospitalAddress;
        ERC20Token = ERC20Detailed(_tokenAddress);
    }

    /** @dev 病院のみが操作可能
      */
    modifier onlyOwner() {
        require(hospitalAddress == msg.sender);
        _;
    }

    /** @dev 消費したGas量とトランザクションのGasPriceからスマートコントラクトで使用したEther量を記録
      */
    modifier countUsedETH() {
        usedEther += gasleft()*tx.gasprice;
        _;
    }

    /** @dev 患者の情報を取得
      * @return address 患者のアドレス
      * @return string 患者の暗号化済み特記事項
      * @return string 患者の暗号鍵をさらに病院の暗号鍵で暗号化したもの
      */
    function getPatientInfo() public view returns (address, string memory, string memory) {
        return (patientAddress, patientData, patientPassPhrase);
    }

    /** @dev 支払状況の取得
      * @return uint256 デポジット金額
      * @return uint256 登録された医療費
      * @return uint256 未収金金額
      * @return bool 医療費が確定しているか
      */
    function getPaymentStatus() public view returns (uint256, uint256, uint256, bool) {
        return (ERC20Token.balanceOf(address(this)), medicalCost, unpaidCost, signCompleted);
    }

    /** @dev 使用しているERC20トークンの情報を取得
      * @return name トークンの名前
      * @return symbol トークンの単位
      * @return decimals トークンの小数点以下の桁数
      */
    function getTokenData() public view returns (string memory name, string memory symbol, uint8 decimals) {
        name = ERC20Token.name();
        symbol = ERC20Token.symbol();
        decimals = ERC20Token.decimals();
    }

    /** @dev コントラクトで使用したEther量を返す
      * @return uint256 Ether量
      */
    function getUsedEther() public view returns (uint256) {
        return usedEther;
    }

    /** @dev フォールバック関数
      */
    function () external{
    }

    /** @dev 医療費の登録
      * @param _medicalCost 医療費
      */
    function setMedicalCost(uint256 _medicalCost) public onlyOwner countUsedETH{
        if(signCompleted == true){
            emit EventFailed("setMedicalCost", "確定済み");
            return;
        }
        medicalCost = _medicalCost;
        emit SetMedicalCost(medicalCost);
    }

    /** @dev 医療費の確定
      * @param _signature 文字列に変換した医療費に対する患者の署名
      */
    function signMedicalCost(bytes memory _signature) public onlyOwner countUsedETH{
        if(signCompleted == true){
            emit EventFailed("signMedicalCost", "確定済み");
            return;
        }
        if(recoverAddress(uintToString(medicalCost), _signature) != patientAddress){
            emit EventFailed("signMedicalCost", "患者による署名でない");
            return;
        }
        unpaidCost = medicalCost;
        signCompleted = true;
        emit SignMedicalCost(true);
    }

    /** @dev 明細登録後の医療費の引き出し
      */
    function withDraw() public onlyOwner countUsedETH{
        if(signCompleted == false){
            emit EventFailed("withDraw", "医療費未確定");
            return;
        }
        uint256 tokenBalance = ERC20Token.balanceOf(address(this));
        uint256 transferBalance;

        if(tokenBalance == 0) {
            emit EventFailed("withDraw", "デポジットがありません");
            return;
        }else if(tokenBalance <= unpaidCost) {
            transferBalance = tokenBalance;
            unpaidCost -= tokenBalance;
        }else{
            transferBalance = unpaidCost;
            unpaidCost = 0;
        }

        // 病院側に送金
        if(transferBalance > 0) ERC20Token.transfer(hospitalAddress, transferBalance);

        // 患者側に返金
        if(unpaidCost == 0) ERC20Token.transfer(hospitalAddress, tokenBalance-transferBalance);

        emit WithDraw(unpaidCost);
    }

    /** @dev 簡易的な診療記録の書き込み
      */
    function addMedicalNote(string memory _note) public onlyOwner countUsedETH {
        medicalNotes.push(MedicalNote(_note, now));
        emit AddMedicalNote(now, _note);
    }
    
    /** @dev 簡易的な診療記録の読み込み
      */
    function getMedicalNotes() public view returns (MedicalNote[] memory) {
        return medicalNotes;
    }
    
    function getPatientAddress() public view returns (address){
        return patientAddress;
    }

    function recoverAddress(string memory _message, bytes memory signature) private pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n";
        string memory length = uintToString(bytes(_message).length);
        bytes32 prefixHash = keccak256(abi.encodePacked(prefix, length, _message));
        address signer = ECDSA.recover(prefixHash, signature);
        require(signer != address(0));
        return signer;
    }

    function uintToString(uint256 v) private pure returns (string memory) {
        if(v == 0) return "0";
        uint maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint256 i = 0;
        while (v != 0) {
            uint256 remainder = v % 10;
            v = v / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i);
        for (uint256 j = 0; j < i; j++) {
            s[j] = reversed[i - 1 - j];
        }
        return string(s);
    }
}