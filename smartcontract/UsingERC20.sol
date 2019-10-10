pragma solidity ^0.5.10;
pragma experimental ABIEncoderV2;

import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract UsingERC20{
    ERC20Detailed internal ERC20Token;
    TokenData internal tokenData;
    
    struct TokenData{
        string name;
        string symbol;
        uint8 decimals;
    }

    // 使用するERC20 Tokenのコントラクトアドレスで初期化
    constructor(address _tokenAddress) public{
        ERC20Token = ERC20Detailed(_tokenAddress);
        tokenData.name = ERC20Token.name();
        tokenData.symbol = ERC20Token.symbol();
        tokenData.decimals = ERC20Token.decimals();
    }
    
    function getTokenData() public view returns (TokenData memory){
        return tokenData;
    }
}

contract TestERC20Token is ERC20, ERC20Detailed{

    string private _name = "TestUSD";
    string private _symbol = "TUSD";
    uint8 private _decimals = 18;

    // 10000.0000...
    uint private value = 10000000000000000000000;

    constructor() ERC20Detailed( _name, _symbol, _decimals) public {
        _mint( msg.sender, value);
    }
    
    function getToken() public {
        _mint(msg.sender, value);
    }
}