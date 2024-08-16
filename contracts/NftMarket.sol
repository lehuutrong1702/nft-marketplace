// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract NftMarket is ERC721URIStorage{
    
    using Counters for Counters.Counter;

    Counters.Counter private _listedItems;
    Counters.Counter private _tokenIds;


    struct NftItem {
        uint tokenId;
        uint price;
        address creator;
        bool isListed;
    }

    uint256[] _allNfts ; 

    uint public listingPrice  = 0.025 ether;
    
    mapping (string => bool) private _usedTokenURI;
    mapping (uint => NftItem) private _idToNftItem;
    mapping(uint => uint) private _idToNftIndex;

    event NftItemCreated(
        uint tokenId,
        uint price,
        address creator,
        bool isListed
    );

    constructor() ERC721("CreaturesNFT","CNFT") {}


    function _createNftItem(uint tokenId, uint price) private {
        require(price > 0 , "price must be at least 1 wei");

        _idToNftItem[tokenId] = NftItem(
            tokenId,
            price,
            msg.sender,
            true
        );

        emit NftItemCreated(tokenId, price, msg.sender, true);
    }


    function totalSupply() public view returns (uint) {
        return _allNfts.length;
    }

    function tokenByIndex(uint index) public view returns (uint) {
    require(index < totalSupply(), "Index out of bounds");
    return _allNfts[index];
  }

    function getNftItem(uint tokenId) public view returns(NftItem memory){
        return _idToNftItem[tokenId];
    }


    function listedItemsCount() public view returns(uint) {
        return _listedItems.current();
    }

    function tokenURIExists(string memory tokenURI) public view returns (bool) {
        return _usedTokenURI[tokenURI] == true;
    }

    function buyNft(uint tokenId) public payable {

            uint price = _idToNftItem[tokenId].price;
            address owner = ownerOf(tokenId);
            
            require(msg.sender != owner , "you already own this NFT");
            require(msg.value == price,"please submit the asking price");

            _idToNftItem[tokenId].isListed = false;
            _listedItems.decrement();

            _transfer(owner, msg.sender, tokenId);
            payable(owner).transfer(msg.value);


    }


    function mintToken(string memory tokenURI, uint price) public payable returns (uint){
        require(!tokenURIExists(tokenURI),"Token URI already exist");
        require(msg.value == listingPrice , "price is equal to listing price");


        _tokenIds.increment();
        _listedItems.increment();

        uint newTokenId = _tokenIds.current();

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        _createNftItem(newTokenId,price);

        _usedTokenURI[tokenURI] = true;
        
        return newTokenId;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from,to,tokenId);

        if (from == address(0)) {
            _addTokenToAllTokensEnumaration(tokenId);
        }
        
    }

    function _addTokenToAllTokensEnumaration(uint tokenId) private {
        _idToNftIndex[tokenId] = _allNfts.length;
        _allNfts.push(tokenId);


    }
    
}