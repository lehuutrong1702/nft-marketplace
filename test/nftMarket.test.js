const NftMarket = artifacts.require("NftMarket");
const {ethers} = require("ethers");


contract("NftMarket", accounts => {
  let _contract = null;
  let _nftPrice = ethers.utils.parseEther("0.3").toString();
  let _listingPrice =  ethers.utils.parseEther("0.025").toString();

  before(async () => {
    _contract = await NftMarket.deployed();
    console.log(accounts);
  })

  describe("Mint token", () => {
        const tokenURI = "https://test.com";
        before(async () => {
            
        await _contract.mintToken(tokenURI,_nftPrice, {
            from: accounts[0],
            value: _listingPrice
        })

        })

        it("owner of the first token should be address[0]", async () => {
        const owner = await _contract.ownerOf(1);
        assert.equal(owner, accounts[0], "Owner of token is not matching address[0]");
        })

        it("first token should point to the correct tokenURI", async () => {
            const actualTokenURI = await _contract.tokenURI(1);
      
            assert.equal(actualTokenURI, tokenURI, "tokenURI is not correctly set");
          })
          
        it("should not be possible to create a NFT with used tokenURI", async () => {
         try {
            await _contract.mintToken(tokenURI,_nftPrice, {
              from: accounts[0],
              value: _listingPrice
            })
         } catch(error) {
            assert (error,"NFT was minted with previously used tokenURI")
         }
        })

        it("should have one listed item", async () => {
          const listedItemCount = await _contract.listedItemsCount();
          assert.equal(listedItemCount.toNumber(), 1, "Listed items count is not 1");
        })
        it("should have create NFT item", async () => {
          const nftItem = await _contract.getNftItem(1);
    
          assert.equal(nftItem.tokenId, 1, "Token id is not 1");
          assert.equal(nftItem.price, _nftPrice, "Nft price is not correct");
          assert.equal(nftItem.creator, accounts[0], "Creator is not account[0]");
          assert.equal(nftItem.isListed, true, "Token is not listed");
        })

    })

    describe("buy NFT", () => {
      
      before( async () =>{
        await _contract.buyNft(1, {
          from: accounts[1],
          value: _nftPrice
        })
      })

      it("should unlist the item", async() => {
        const listedItem = await _contract.getNftItem(1);
        assert.equal(listedItem.isListed,false,"Item is still listed");
      })
      
      it("should decrease listed item count", async () =>{
        const listedItemCount = await _contract.listedItemsCount();
        assert.equal(listedItemCount.toNumber(),0,"count has not been decrement");
      })

      it("should change the owner", async () =>{
        const currentOwner = await _contract.ownerOf(1);
        assert.equal(currentOwner,accounts[1],"Owner is not changed");
      })

    })

    describe("transfer token", () =>{

        const _tokenURI = "https://test-json-2.com"
          
        before( async () =>{
          await _contract.mintToken(_tokenURI, _nftPrice, {
            from: accounts[0],
            value: _listingPrice
          })     })

        it("should have 2 token created", async () => {
          const totalSupply  = await _contract.totalSupply();
          assert.equal(totalSupply.toNumber(),2,"total supply of tokens is not correct")
        })

        it("should be able to retrive nft by index", async () => {
          const index1 = await _contract.tokenByIndex(0);
          const index2 = await _contract.tokenByIndex(1);

          assert.equal(index1.toNumber(), 1, "token retrive not correct");
          assert.equal(index2.toNumber(), 2, "token retrive not correct");

        })

        it("should have one listed NFT", async () => {
          const allNfts = await _contract.getAllNftsOnSale();
          assert.equal(allNfts[0].tokenId, 2, "Nft has a wrong id");
        })

        it("accounts[1] should have one owned NFT", async () => {
          const allNfts = await _contract.getOwnedNfts({from:accounts[1]})
          assert.equal(allNfts[0].tokenId,1,"Nft has a wrong id")
        })
    
        it("accounts[0] should have one owned NFT", async () => {
          const allNfts = await _contract.getOwnedNfts({from:accounts[0]})
          assert.equal(allNfts[0].tokenId,2,"Nft has a wrong id")
        })
    
    })

    describe("Token transfer to new owner", () => {
      before(async () => {
        await _contract.transferFrom(
          accounts[0],
          accounts[1],
          2
        )
      })
  
      it("accounts[0] should own 0 tokens", async () => {
        const ownedNfts = await _contract.getOwnedNfts({from: accounts[0]});
        assert.equal(ownedNfts.length, 0, "Invalid length of tokens");
      })
  
      it("accounts[1] should own 2 tokens", async () => {
        const ownedNfts = await _contract.getOwnedNfts({from: accounts[1]});
        assert.equal(ownedNfts.length, 2, "Invalid length of tokens");
      })
    })
})