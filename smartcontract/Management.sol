pragma solidity 0.5.16;
pragma experimental ABIEncoderV2;

import "./Examination.sol";

contract Management{

    event StartExamination(address contractAddress, address indexed hospitalAddress, address indexed patientAddress, address tokenAddress, uint32 indexed random);

    address private owner;
    mapping (address => ExaminationInfo[]) private examinationList;

    struct ExaminationInfo{
        Examination examinationContract;
        uint256 start;
    }

    constructor() public {
        owner = msg.sender;
    }
    
    /** @dev 患者から署名付きの患者データを受け取ってスマートコントラクトをデプロイ
      * @param _patientData 患者データを暗号化した物
      * @param _signature _patientDataに対する患者の署名
      * @param _patientPassPhrase 患者の暗号鍵をさらに病院の暗号鍵で暗号化したもの
      */
    function startExamination(string memory _patientData, bytes memory _signature, string memory _patientPassPhrase, address _tokenAddress, uint32 _random) public{
        Examination tmp = new Examination(_patientData, _signature, _patientPassPhrase, msg.sender, _tokenAddress);
        examinationList[msg.sender].push(ExaminationInfo(tmp, now));
        // 署名を検証してアドレスを出す
        emit StartExamination(address(tmp), msg.sender, tmp.getPatientAddress(), _tokenAddress, _random);
    }

    function getExaminationList() public view returns(ExaminationInfo[] memory){
        return examinationList[msg.sender];
    }
}