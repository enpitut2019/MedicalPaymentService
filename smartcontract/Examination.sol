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
    ERC20Detailed internal ERC20Token;

    event SetMedicalCost(uint256 medicalCost);
    event SignMedicalCost(bool signed);
    event WithDraw(uint256 unpaidCost);
    event Refund(uint256 amount);
    
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
    function getPaymentStatus() public view returns (uint256 balance, uint256 medicalCost, uint256 unpaidCost, bool signCompleted) {
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
        require(signCompleted == false);
        medicalCost = _medicalCost;
        emit SetMedicalCost(medicalCost);
    }
    
    /** @dev 医療費の確定 
      * @param _signature 文字列に変換した医療費に対する患者の署名
      */
    function signMedicalCost(bytes memory _signature) public onlyOwner countUsedETH{
        require(signCompleted == false, "医療費が既に確定");
        require(recoverAddress(uintToString(medicalCost), _signature) == patientAddress, "患者による署名でない");
        unpaidCost = medicalCost;
        signCompleted = true;
        emit SignMedicalCost(true);
    }
    
    /** @dev 明細登録後の医療費の引き出し
      */
    function withDraw() public onlyOwner countUsedETH{
        require(signCompleted == true);
        uint256 tokenBalance = ERC20Token.balanceOf(address(this));
        
        if(tokenBalance == 0) {
            // 何もしない
        }else if(tokenBalance <= unpaidCost) {
            ERC20Token.transfer(hospitalAddress, tokenBalance);
            unpaidCost -= tokenBalance;
        }else{
            ERC20Token.transfer(hospitalAddress, unpaidCost);
            unpaidCost = 0;
            // 余った分は返金
            refund();
        }
        emit WithDraw(unpaidCost);
    }
    
    /** @dev トークン残高全てを患者へ送金
      */
    function refund() private onlyOwner countUsedETH{
        uint256 tokenBalance = ERC20Token.balanceOf(address(this));
        ERC20Token.transfer(patientAddress, tokenBalance);
        emit Refund(tokenBalance);
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