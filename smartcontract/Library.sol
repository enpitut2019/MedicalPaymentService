pragma solidity ^0.5.10;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

contract Library{
    function recoverAddress(string memory _message, bytes memory signature) internal pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n";
        string memory length = uintToString(bytes(_message).length);
        bytes32 prefixHash = keccak256(abi.encodePacked(prefix, length, _message));
        address signer = ECDSA.recover(prefixHash, signature);
        require(signer != address(0));
        return signer;
    }
    
    function uintToString(uint256 v) internal pure returns (string memory) {
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

contract recoverAddressTest is Library{
    address public signer;
    // private key = 0x917852116674bceb21d8ddb19ab91671b7f17db021fb41539b8667a5b2d20ce2
    // address = 0x2D031F7DF3DA1fBf86561cBD597e018c52BdCAad
    // message = "Test Message"
    // signature = 0x9dbbdb5eb6539960a0789fab7fe809e1c6bed8df01288cbc04579952f258b5b03b60827e502dad34acae927f2e07cf572ca94996f142689bdbd5c5c9bcc0f66e1b
    constructor(string memory _message, bytes memory _signature) public{
        signer  = recoverAddress(_message, _signature);
    }
}