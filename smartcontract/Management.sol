pragma solidity ^0.5.11;
pragma experimental ABIEncoderV2;

import "./Examination.sol";

contract Management{

    event StartExamination(address contractAddress, address indexed hospitalAddress, address indexed patientAddress, address tokenAddress, uint32 indexed random);
    
    address tokenAddress = 0xBF8AC0D55453C6d240273404c11FfBbD33E65aF7; // TestUSD
    address owner;
    mapping (address => ExaminationInfo[]) examinationList;
    mapping (address => string) publicKey;

    struct ExaminationInfo{
        Examination examinationContract;
        uint256 start;
    }

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }
    
    constructor() public {
        owner = msg.sender;
        // string memory serverPublicKey =  "-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKy8bRAXGLZmStIOYPk2vcN7WMql0YRE\nBgJzvWx+hYxGChEQhkECE1RehvC66Mn5m/sNaRAlJmSFXuOS7nvMnjUCAwEAAQ==\n-----END PUBLIC KEY-----";
        // setPublicKey(serverPublicKey, msg.sender);
    }
    
    /** @dev 患者から署名付きの患者データを受け取ってスマートコントラクトをデプロイ
      * @param _patientData 患者データを暗号化した物
      * @param _signature _patientDataに対する患者の署名
      * @param _patientPassPhrase 患者の暗号鍵をさらに病院の暗号鍵で暗号化したもの
      */
    function startExamination(string memory _patientData, bytes memory _signature, string memory _patientPassPhrase, uint32 _random) public{
        Examination tmp = new Examination(_patientData, _signature, _patientPassPhrase, msg.sender, tokenAddress);
        examinationList[msg.sender].push(ExaminationInfo(tmp, now));
        // 署名を検証してアドレスを出す
        emit StartExamination(address(tmp), msg.sender, tmp.getPatientAddress(), tokenAddress, _random);
    }

    function getExaminationList() public view returns(ExaminationInfo[] memory){
        return examinationList[msg.sender];
    }
    
    /*
    function setPublicKey(string memory _publicKey, address _hospitaladdress) public onlyOwner{
        publicKey[_hospitaladdress] = _publicKey;
    }
    
    function getPublicKey(address _hospitaladdress)public view returns(string memory){
        return publicKey[_hospitaladdress];
    }
    
    function getOwnerPublicKey() public view returns(string memory){
        return getPublicKey(owner);
    }
    */
}