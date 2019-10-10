pragma solidity ^0.5.10;
pragma experimental ABIEncoderV2;

import "./Library.sol";
import "./UsingERC20.sol";

contract Examination is UsingERC20, Library{
    address hospitalAddress;
    address patientAddress;
    uint256 medicalCost;
    uint256 unpaidCost;
    bool signCompleted;
    string patientData;
    string patientPassPhrase;
    // contractで消費したETH（usedGas*gasPriceの合計）
    uint256 usedETH;
    address public test;
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
    constructor(string memory _patientData, bytes memory _signature, string memory _patientPassPhrase, address _hospitalAddress, address _tokenAddress) UsingERC20(_tokenAddress) public countUsedETH{
        hospitalAddress = _hospitalAddress;
        patientData = _patientData;
        patientPassPhrase = _patientPassPhrase;
        patientAddress = recoverAddress(_patientData, _signature);
    }
    
    modifier onlyOwner() {
        require(hospitalAddress == msg.sender);
        _;
    }
    
    modifier countUsedETH() {
        usedETH += gasleft()*tx.gasprice;
        _;
    }
    
    //Hospital Contaractから呼ぶ
    function getPatientAddress() public view returns(address){
        return patientAddress;
    }
    
    /** @dev 患者から署名付きの患者データを受け取ってスマートコントラクトを初期化
      * @return address 患者のアドレス
      * @return string 患者の暗号化済み特記事項
      * @return string 患者の暗号鍵をさらに病院の暗号鍵で暗号化したもの
      * @return uint256 デポジット金額
      * @return uint256 登録された医療費
      * @return uint256 未収金金額
      * @return bool 署名済みか？
      * @return uint256 contractで消費したETH
      * @return TokenData 使用するERC20Tokenの情報
      */
    function getContractData() public view returns(address, string memory, string memory, uint256, uint256, uint256, bool, uint256, TokenData memory){
        return (patientAddress, patientData, patientPassPhrase, ERC20Token.balanceOf(address(this)), medicalCost, unpaidCost, signCompleted, usedETH, getTokenData());
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
        require(signCompleted == false);
        /* これはいらない */
        require(medicalCost != 0);
        // 署名が患者によって行われているか
        require(recoverAddress(uintToString(medicalCost), _signature) == patientAddress);
        unpaidCost = medicalCost;
        signCompleted = true;
        emit SignMedicalCost(true);
    }
    
    /** @dev 明細登録後の医療費の引き出し
             余った分は患者に返金される
      */
    function withDraw() public onlyOwner countUsedETH{
        require(signCompleted == true);
        uint256 tokenBalance = ERC20Token.balanceOf(address(this));
        
        if(tokenBalance == 0){
            // 何もしない
        }else if(tokenBalance <= unpaidCost){
            ERC20Token.transfer(hospitalAddress, tokenBalance);
            unpaidCost -= tokenBalance; 
            emit WithDraw(unpaidCost);
        }else{
            ERC20Token.transfer(hospitalAddress, unpaidCost);
            emit WithDraw(0);
            unpaidCost = 0;
            // 余った分は返金
            refund();
        }
    }
    
    /** @dev トークン残高全てを患者へ送金
      */
    function refund() private onlyOwner countUsedETH{
        uint256 tokenBalance = ERC20Token.balanceOf(address(this));
        ERC20Token.transfer(patientAddress, tokenBalance);
        emit Refund(tokenBalance);
    }
}