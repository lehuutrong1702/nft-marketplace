// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NftMarket is ERC721URIStorage , Ownable{
    
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
    
    mapping (address => mapping (uint => uint)) private _ownedTokens;

    mapping (uint => uint) private _idToOwnedIndex;


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




    function totalSupply() public view returns (uint) {
        return _allNfts.length;
    }

    function tokenByIndex(uint index) public view returns (uint) {
    require(index < totalSupply(), "Index out of bounds");
    return _allNfts[index];
  }

    function burnToken(uint tokenId) public {
        _burn(tokenId);
    }

    function setListingPrice(uint newPrice) external onlyOwner{
        require(newPrice > 0, "Price must be at least 1 wei");
        listingPrice = newPrice;
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


    function tokenOfOwnerByIndex(address owner, uint index) public view returns (uint){
        require(index < balanceOf(owner), "index is out of bounds");
        return _ownedTokens[owner][index];


    }

    function placeNftOnSale(uint tokenId, uint newPrice) public payable{
        require(ownerOf(tokenId) == msg.sender , "you are not owner of this NFT");
        require(msg.value != listingPrice , "price must be equal to listing price");
        require(_idToNftItem[tokenId].isListed == false , "item is already on sale");

        _idToNftItem[tokenId].isListed = true;
        _idToNftItem[tokenId].price = newPrice;
        _listedItems.increment();

    }

    function getOwnedNfts() public view returns (NftItem[] memory){
        uint ownedItemsCount = ERC721.balanceOf(msg.sender);
        NftItem[] memory items = new NftItem[](ownedItemsCount);
        
        for (uint i = 0 ; i< ownedItemsCount ; i++){
            uint tokenId = tokenOfOwnerByIndex(msg.sender, i);
            NftItem storage item = _idToNftItem[tokenId];
            items[i] = item;
        }

        return items;
    }
    function getAllNftsOnSale() public view returns (NftItem[] memory){
        uint allItemsCounts = totalSupply();
        uint index = 0 ;
        NftItem[] memory items = new NftItem[] (_listedItems.current());

        for (uint i = 0 ; i< allItemsCounts; i++){
            uint tokenId = tokenByIndex(i);
            NftItem storage item = _idToNftItem[tokenId];
            if(item.isListed) {
                items[index] = item;
                index++;
            }

        }

        return items;
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

    function _beforeTokenTransfer(
        address from,
        address to,
        uint tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from,to,tokenId);

        if (from == address(0)) {
            _addTokenToAllTokensEnumeration(tokenId);
        } else if (from != to ){
            _removeTokenFromOwnerEnumeration(from,tokenId);
        }

        if (to == address(0)) {
            _removeTokenFromAllTokensEnumeration(tokenId);
        } else if (to != from) {
            _addTokenToOwnerEnumeration(to, tokenId);
        }

    }

    function _addTokenToAllTokensEnumeration(uint tokenId) private {
        _idToNftIndex[tokenId] = _allNfts.length;
        _allNfts.push(tokenId);
    }

    function _addTokenToOwnerEnumeration(address to, uint tokenId) private {
        uint length = balanceOf(to);
        _ownedTokens[to][length] = tokenId;
        _idToOwnedIndex[tokenId] = length;
    }
    
    function _removeTokenFromOwnerEnumeration(address from, uint tokenId) private {
            uint lastTokenIndex = balanceOf(from) - 1 ;
            uint tokenIndex = _idToOwnedIndex[tokenId];
            if (tokenIndex != lastTokenIndex){
                uint lastTokenId = _ownedTokens[from][lastTokenIndex];
                _ownedTokens[from][tokenIndex] = lastTokenId;
                _idToOwnedIndex[lastTokenId] = tokenIndex ;
            }

            delete _idToOwnedIndex[tokenId];
            delete _ownedTokens[from][lastTokenIndex];

    }
    function _removeTokenFromAllTokensEnumeration(uint tokenId) private {
            uint lastTokenIndex = _allNfts.length - 1;
            uint tokenIndex = _idToNftIndex[tokenId];
            uint lastTokenid =  _allNfts[lastTokenIndex] ;
    
            _allNfts[tokenIndex] = lastTokenid ;
            _idToNftIndex[lastTokenid]  = tokenIndex;
      
            _allNfts.pop();

            delete _idToNftIndex[tokenId];
    }

}