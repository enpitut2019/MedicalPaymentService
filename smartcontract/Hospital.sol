pragma solidity ^0.5.10;
pragma experimental ABIEncoderV2;

import "./Examination.sol";

contract Hospital{
    
    event StartExamination(address contractAddress, address hospitalAddress, address patientAddress);
    address tokenAddress = 0x0abcd3eE0378B6BB406cFa8Ea4521E7B03b89713; // TestUSD
    
    mapping (address => ExaminationInfo[]) examinationList;

    struct ExaminationInfo{
        string passportNo;
        Examination examinationContract;
        uint256 start;
    }
    
    /** @dev 患者から署名付きの患者データを受け取ってスマートコントラクトをデプロイ
      * @param _patientData 患者データを暗号化した物
      * @param _signature _patientDataに対する患者の署名
      * @param _patientPassPhrase 患者の暗号鍵をさらに病院の暗号鍵で暗号化したもの
      */
    function startExamination(string memory _passportNo, string memory _patientData, bytes memory _signature, string memory _patientPassPhrase) public{
        Examination tmp = new Examination(_patientData, _signature, _patientPassPhrase, msg.sender, tokenAddress);
        examinationList[msg.sender].push(ExaminationInfo(_passportNo, tmp, now));
        emit StartExamination(address(tmp), msg.sender, tmp.getPatientAddress());
    }
    
    function getExaminationList() public view returns(ExaminationInfo[] memory){
        return examinationList[msg.sender];
    }
}
